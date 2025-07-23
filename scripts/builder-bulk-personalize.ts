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
        
        // Get the template lesson
        const templateLesson = await lessonsCollection.findOne({ id: 'lesson-1753021190495'});
        if (!templateLesson) {
            console.error('Template lesson not found');
            return;
        }

        // Create personalized lessons for each beta user
        const operations = betaUsers.map(user => {
            const personalizedLesson = createPersonalizedLesson(templateLesson, user);
            return {
                insertOne: {
                    document: personalizedLesson
                }
            };
        });

        // Track lesson IDs and emails
        const lessonTracking: { _id: any; email: string }[] = [];

        // Bulk insert into MongoDB
        if (operations.length > 0) {
            const result = await lessonsCollection.bulkWrite(operations);
            console.log(`Created ${result.insertedCount} personalized lessons`);
            
            // Store lesson IDs with corresponding emails
            Object.entries(result.insertedIds).forEach(([index, id]) => {
                const user = betaUsers[parseInt(index)];
                lessonTracking.push({ _id: id, email: user.email });
                console.log(`Created lesson for ${user.email}: ${id}`);
            });

            // Get AST lesson template
            const { ObjectId } = require('mongodb');
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
            }

            // Update module with new lesson IDs
            await astModulesCollection.updateOne(
                { _id: new ObjectId(MODULE_ID) },
                { $push: { lessons: { $each: astLessonIds } } } as any
            );

            console.log(`Updated module with ${astLessonIds.length} new lessons`);
        }

    } catch (error) {
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
