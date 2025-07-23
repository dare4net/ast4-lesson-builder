import clientPromise from '../lib/mongodb_script';
import { ObjectId } from 'mongodb';

const LESSONS_DB = 'ast_lessons';
const LESSONS_COLLECTION = 'lessons';
const BETA_DB = 'ast_beta';
const BETA_COLLECTION = 'beta_invite';
const AST_DB = 'afterschooltech';
const AST_LESSON_COLLECTION = 'lessons';
const AST_MODULES_COLLECTION = 'modules';
const MODULE_ID = '687e14d1452f8a0ab2f97660';
const LESSON_PREFIX = 'lesson-1753021190495-';

async function processBetaUsers() {
    const client = await clientPromise;
    const betaDb = client.db(BETA_DB);
    const lessonsDb = client.db(LESSONS_DB);
    const astDb = client.db(AST_DB);
    
    try {
        const betaCollection = betaDb.collection(BETA_COLLECTION);
        const lessonsCollection = lessonsDb.collection(LESSONS_COLLECTION);
        const astLessonsCollection = astDb.collection(AST_LESSON_COLLECTION);
        const astModulesCollection = astDb.collection(AST_MODULES_COLLECTION);

        // Get all users from beta_invite collection
        const betaUsers = await betaCollection.find({}).toArray();
        
        // Find lessons with matching ID pattern
        const lessonTracking: { _id: ObjectId; email: string }[] = [];
        
        console.log('Searching for existing personalized lessons...');
        for (const user of betaUsers) {
            const userNameNoSpaces = user.name.replace(/\s+/g, '');
            const lessonIdPattern = `${LESSON_PREFIX}${userNameNoSpaces}`;
            
            const lesson = await lessonsCollection.findOne({ id: lessonIdPattern });
            
            if (lesson) {
                lessonTracking.push({
                    _id: lesson._id,
                    email: user.email
                });
                console.log(`Found lesson for ${user.email}: ${lesson._id}, with id: ${lesson.id}`);
            } else {
                console.log(`No lesson found for pattern: ${lessonIdPattern}`);
            }
        }

        if (lessonTracking.length === 0) {
            console.log('No matching lessons found');
            return;
        }
        
        console.log(`Found ${lessonTracking.length} lessons to process`);

        // Get AST lesson template
        const astLessonTemplate = await astLessonsCollection.findOne({ 
            _id: new ObjectId("687e1418452f8a0ab2f9765c")
        });

        if (!astLessonTemplate) {
            console.error('AST lesson template not found');
            return;
        }

        // Create lesson replicas
        const astLessonIds = [];
        for (const track of lessonTracking) {
            const lessonReplica = {
                ...astLessonTemplate,
                _id: undefined, // Let MongoDB generate new ID
                lesson_data: track._id,
                access: {
                    type: "email",
                    auth: [track.email]
                }
            };
            const inserted = await astLessonsCollection.insertOne(lessonReplica);
            astLessonIds.push(inserted.insertedId);
            console.log(`Created AST lesson for ${track.email}: ${inserted.insertedId}`);
        }

        // Update module with new lesson IDs
        await astModulesCollection.updateOne(
            { _id: new ObjectId(MODULE_ID) },
            { $push: { lessons: { $each: astLessonIds } } } as any
        );

        console.log(`Updated module with ${astLessonIds.length} new lessons`);    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

function createPersonalizedLesson(lessonDoc: any, user: any) {
    const personalizedLesson = JSON.parse(JSON.stringify(lessonDoc));
    delete personalizedLesson._id;

    // Modify the id property by appending user's name (without spaces)
    if (personalizedLesson.id) {
        personalizedLesson.id = `${personalizedLesson.id}-${user.name.replace(/\s+/g, '')}`;
    }

    // Replace values in content without modifying structure
    const personalizations = {
        'Dami': (user.nickname === 'yes' || user.nickname === 'No') ? user.name : user.nickname,
        'chatzteam@gmail.com': user.email,
        'Rice': user.favFood || 'Rice',
        'Blue': user.favColor || 'Blue',
        'web-dev': user.course || 'web-dev',
    };

    return replaceValues(personalizedLesson, personalizations);
}

// Function to recursively replace values in objects and arrays
function replaceValues(obj: any, personalizations: Record<string, string>): any {
    if (typeof obj === 'string') {
        let modifiedString = obj;
        Object.entries(personalizations).forEach(([key, value]) => {
            const regex = new RegExp(key, 'gi');
            modifiedString = modifiedString.replace(regex, value);
        });
        return modifiedString;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => {
            if (typeof item === 'object' && item !== null) {
                return replaceValues(item, personalizations);
            }
            if (typeof item === 'string') {
                return replaceValues(item, personalizations);
            }
            return item;
        });
    }

    if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
            obj[key] = replaceValues(obj[key], personalizations);
        });
    }
    return obj;
}

processBetaUsers().then(() => {
    console.log('Finished processing all beta users');
}).catch((error) => {
    console.error('Error:', error);
});
