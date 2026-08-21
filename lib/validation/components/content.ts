import { ComponentValidator, ComponentValidationResult } from '../types';
import { createResult, addError, addWarning } from './base-utils';

// Heading & slideTitle Validator
export const headingValidator: ComponentValidator = {
    type: 'heading',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const content = component.props?.content;

        if (typeof content !== 'string' || content.trim() === '') {
            addError(res, 'MISSING_CONTENT', 'props.content', 'Heading text cannot be empty.');
        } else if (content.length > 80) {
            addWarning(
                res,
                'HEADING_TOO_LONG',
                'props.content',
                'Heading is over 80 characters long.',
                'Keep headings concise for clean visual hierarchy.'
            );
        }
        return res;
    }
};

export const slideTitleValidator: ComponentValidator = {
    type: 'slideTitle',
    validate: (component) => headingValidator.validate(component)
};

// Paragraph Validator
export const paragraphValidator: ComponentValidator = {
    type: 'paragraph',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const content = component.props?.content;

        if (typeof content !== 'string' || content.trim() === '') {
            addError(res, 'MISSING_CONTENT', 'props.content', 'Paragraph text cannot be empty.');
        } else if (content.length > 600) {
            addWarning(
                res,
                'PARAGRAPH_TOO_LONG',
                'props.content',
                'Paragraph exceeds 600 characters.',
                'Consider splitting long text into bullet points or interleaving an interactive activity to sustain engagement.'
            );
        }
        return res;
    }
};

// BulletList Validator
export const bulletListValidator: ComponentValidator = {
    type: 'bulletList',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const items = component.props?.items;

        if (!Array.isArray(items) || items.length === 0) {
            addError(res, 'EMPTY_ITEMS', 'props.items', 'Bullet list must contain at least one item.');
        } else {
            items.forEach((item, idx) => {
                if (typeof item !== 'string' || item.trim() === '') {
                    addWarning(res, 'EMPTY_LIST_ITEM', `props.items[${idx}]`, `List item ${idx + 1} is empty.`);
                }
            });
        }
        return res;
    }
};

// Table Validator
export const tableValidator: ComponentValidator = {
    type: 'table',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { rows, columns, data } = component.props || {};

        if (typeof rows !== 'number' || rows < 1) {
            addError(res, 'INVALID_ROWS', 'props.rows', 'Table rows must be at least 1.');
        }
        if (typeof columns !== 'number' || columns < 1) {
            addError(res, 'INVALID_COLUMNS', 'props.columns', 'Table columns must be at least 1.');
        }

        if (!Array.isArray(data)) {
            addError(res, 'INVALID_DATA', 'props.data', 'Table data grid must be an array of row arrays.');
        } else {
            if (data.length !== rows) {
                addError(res, 'ROW_COUNT_MISMATCH', 'props.data', `Data contains ${data.length} rows, but table is set to ${rows} rows.`);
            }

            data.forEach((row, rIdx) => {
                if (!Array.isArray(row)) {
                    addError(res, 'INVALID_ROW', `props.data[${rIdx}]`, `Row ${rIdx + 1} must be an array.`);
                } else {
                    if (row.length !== columns) {
                        addError(res, 'COLUMN_COUNT_MISMATCH', `props.data[${rIdx}]`, `Row ${rIdx + 1} has ${row.length} cells, but expected ${columns}.`);
                    }
                    row.forEach((cell, cIdx) => {
                        if (typeof cell === 'string' && /<[a-z][\s\S]*>/i.test(cell)) {
                            addError(
                                res,
                                'HTML_IN_TABLE_CELL',
                                `props.data[${rIdx}][${cIdx}]`,
                                `Cell [${rIdx + 1}, ${cIdx + 1}] contains HTML tags ("${cell}"). Table data MUST be plain text only.`
                            );
                        }
                    });
                }
            });
        }
        return res;
    }
};

// Image Validator
export const imageValidator: ComponentValidator = {
    type: 'image',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { src, caption } = component.props || {};

        if (typeof src !== 'string' || src.trim() === '') {
            addError(res, 'MISSING_IMAGE_SRC', 'props.src', 'Image source URL or asset path is required.');
        } else if (src.includes('/placeholder.svg') || src.includes('/placeholder.')) {
            addWarning(
                res,
                'PLACEHOLDER_IMAGE_USED',
                'props.src',
                'Image is currently using a default placeholder SVG.',
                'Replace placeholder with a real educational diagram or photograph.'
            );
        }

        if (!caption || typeof caption !== 'string' || caption.trim() === '') {
            addWarning(
                res,
                'MISSING_CAPTION',
                'props.caption',
                'Image has no educational caption.',
                'Adding a caption helps students connect the image to the lesson topic.'
            );
        }
        return res;
    }
};

// Video Validator
export const videoValidator: ComponentValidator = {
    type: 'video',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { src, url, caption } = component.props || {};
        const videoLink = url || src;

        if (typeof videoLink !== 'string' || videoLink.trim() === '') {
            addError(res, 'MISSING_VIDEO_SRC', 'props.url', 'Video source URL is required.');
        } else if (videoLink.includes('/placeholder.')) {
            addWarning(res, 'PLACEHOLDER_VIDEO_USED', 'props.url', 'Video is using a placeholder source.');
        }

        if (!caption || typeof caption !== 'string' || caption.trim() === '') {
            addWarning(res, 'MISSING_CAPTION', 'props.caption', 'Consider adding an explanatory caption for the video.');
        }
        return res;
    }
};

// CodeBlock Validator
export const codeBlockValidator: ComponentValidator = {
    type: 'codeBlock',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { code } = component.props || {};

        if (typeof code !== 'string' || code.trim() === '') {
            addError(res, 'MISSING_CODE', 'props.code', 'Code block content cannot be empty.');
        }
        return res;
    }
};

// Quote Validator
export const quoteValidator: ComponentValidator = {
    type: 'quote',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { text } = component.props || {};

        if (typeof text !== 'string' || text.trim() === '') {
            addError(res, 'MISSING_QUOTE_TEXT', 'props.text', 'Quote text cannot be empty.');
        }
        return res;
    }
};

// Callout Validator
export const calloutValidator: ComponentValidator = {
    type: 'callout',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { content } = component.props || {};

        if (typeof content !== 'string' || content.trim() === '') {
            addError(res, 'MISSING_CALLOUT_CONTENT', 'props.content', 'Callout box content cannot be empty.');
        }
        return res;
    }
};

// Accordion Validator
export const accordionValidator: ComponentValidator = {
    type: 'accordion',
    validate: (component) => {
        const res = createResult(component.id, component.type);
        const { items } = component.props || {};

        if (!Array.isArray(items) || items.length === 0) {
            addError(res, 'EMPTY_ACCORDION_ITEMS', 'props.items', 'Accordion must contain at least one panel item.');
        } else {
            items.forEach((item, idx) => {
                if (!item || typeof item.title !== 'string' || item.title.trim() === '') {
                    addWarning(res, 'EMPTY_ACCORDION_TITLE', `props.items[${idx}].title`, `Accordion item ${idx + 1} has an empty title.`);
                }
            });
        }
        return res;
    }
};
