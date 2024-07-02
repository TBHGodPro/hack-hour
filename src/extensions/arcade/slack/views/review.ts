import { KnownBlock, RichTextQuote } from "@slack/bolt";
import { Actions, Environment } from "../../../../lib/constants.js";
import { formatHour, pfps, randomChoice, t } from "../../../../lib/templates.js";

export class ReviewView {
    public static reviewStart({
        permalink,
        recId,
        text,
    }: {
        permalink: string,
        recId: string,
        text: string,
    }): KnownBlock[] {
        return [
            // {
            //     "type": "header",
            //     "text": {
            //         "type": "plain_text",
            //         "text": "This is a header block",
            //         "emoji": true
            //     }
            // },
            {
                "type": "rich_text",
                "elements": [
                    {
                        "type": "rich_text_quote",
                        "elements": [
                            {
                                type: "text",
                                "style": {
                                    "italic": true
                                },
                                "text": text
                            }
                        ]
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": 
`<${permalink}|Preview>
<https://airtable.com/app4kCWulfB02bV8Q/tbl7FAJtLixWxWC2L/viwjGIE5EEQdBwLs7/${recId}|View on Airtable>`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Start Review",
                        "emoji": true
                    },
                    "url": permalink,
                    "action_id": Actions.START_REVIEW
                }
            }
        ];
    }

    public static scrapbookOverview({
        slackId,
        scrapbookId
    }: {
        slackId: string,
        scrapbookId: string 
    }): KnownBlock[] {
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    // "text": `Review started by <@${body.user.id}>.`
                    "text": t('review.start', { slackId })
                }
            }
        ];
    }

    public static userOverview({
        scrapbookId,
        hours
    }: {
        scrapbookId: string,
        hours: number
    }): KnownBlock[] {
        return [
            {
                "type": "section", 
                "text": {
                    "type": "mrkdwn",
                    "text":
`*User Overview* ${pfps['info']}
user's number of hours: ${formatHour(hours)}
${hours <= 5 ? `woah, looks like they're just getting started! ${pfps['woah']}` : `they've been at it for a while now! ${pfps['thumbs']}`}`
                }                    
            }, 
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `magic happening :sparkles:`,
                        },
                        "action_id": Actions.MAGIC,
                        "value": scrapbookId
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `unsubmit :bangbang:`,
                            "emoji": true,
                        },
                        "style": "danger",
                        "action_id": Actions.UNSUBMIT,
                        "value": scrapbookId,

                        "confirm": {
                            "title": {
                                "type": "plain_text",
                                "text": `are you sure? ${pfps['freaking']}`,
                                "emoji": true
                            },
                            "confirm": {
                                "type": "plain_text",
                                "text": "yes, unsubmit",
                            },
                            "deny": {
                                "type": "plain_text",
                                "text": "i shouldn't have clicked that",
                            },
                            "text": {
                                "type": "mrkdwn",
                                "text": "woah bud, this will remove all sessions linked to this scrapbook. are you sure?"
                            }
                        }
                    }
                ]
            }
        ];
    }

    public static session({
        createdAt,
        minutes,
        text,
        link,
        recId,
        urls,
        evidence,
        images
    }: {
        recId: string

        createdAt: string,
        minutes: number,
        link: string,

        text: string,
        evidence: string,
        urls?: string[],
        images?: string[]
    }): KnownBlock[] {
        const blocks: KnownBlock[] = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": `${new Date(createdAt).toDateString().toLowerCase()} - ${minutes} minutes ${randomChoice([
                        pfps['woah'],
                        pfps['cute'],
                        pfps['thumbs'],
                        pfps['info']
                    ])}`,
                    "emoji": true
                }
            },            
        ];

        blocks.push({
            "type": "rich_text",
            "elements": [
                {
                    "type": "rich_text_preformatted",
                    "elements": [
                        {
                            type: "text",
                            "text": text ? text : "no text provided"
                        }
                    ]
                },
                {
                    "type": "rich_text_preformatted",
                    "elements": [
                        {
                            type: "text",
                            "text": evidence.length > 0 ? evidence : "no messages sent"
                        }
                    ]
                },
                // ...(urls ? [{
                //     "type": "rich_text_quote",
                //     "elements": urls.map(url => ({
                //         "type": "link",
                //         "text": url + '\n',
                //         "url": url,
                //     }))
                // }] as RichTextQuote[] : []),
                // {
                //     "type": "rich_text_section",
                //     "elements": [
                //         {
                //             "type": "link",
                //             "text": `view session`,
                //             "url": link,
                //             "style": {
                //                 "bold": true
                //             }
                //         },
                //     ]
                // }
            ]
        });

        if (urls) {
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": urls.length > 0 ? urls.join('\n') : "no urls provided"
                }
            });
        }

        blocks.push({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `view session: <${link}|here>`
            }
        }, {
            "type": "section",
            "text": {
                "text": `<https://airtable.com/app4kCWulfB02bV8Q/tbl2q5GGdwv252A7q/viwe3w2MTPRpa9uSB/${recId}|override on airtable>`,
                "type": "mrkdwn"
            }
        });

        // add link to airtable

        if (images) {
            images.forEach(image => {
                blocks.push({
                    "type": "image",
                    "image_url": image,
                    "alt_text": "screenshot"
                });
            });
        }

        blocks.push(
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `approve ${pfps['cute']}`,
                            "emoji": true
                        },
                        "value": recId, 
                        "action_id": Actions.APPROVE
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `reject ${pfps['peefest']}`,
                            "emoji": true
                        },
                        "value": recId, 
                        "action_id": Actions.REJECT
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": `close ${pfps['ded']}`,    
                            "emoji": true
                        },
                        "value": recId,
                        "action_id": Actions.REJECT_LOCK
                    }
                ]
            }, {
                "type": "divider"
            });

        return blocks;
    }

    public static approved(sessionId: string, slackId: string | null = null, minutes: number | null = null) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    // "text": `Approved ${slackId ? `by <@${slackId}>` : ` session!`}`
                    "text": (slackId ? t('review.reviewer.approved', { slackId, 
                        minutes: minutes ?? 0
                    }) : t('review.preset.approved')) + `
view session: <https://airtable.com/app4kCWulfB02bV8Q/tbl2q5GGdwv252A7q/viwe3w2MTPRpa9uSB/${sessionId}|here>`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": `undo ${pfps['peefest']}`,
                        "emoji": true
                    },
                    "value": sessionId,
                    "action_id": Actions.UNDO
                }
            },
        ]
    }

    public static rejected(sessionId: string, slackId: string | null = null) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    // "text": `Rejected ${slackId ? `by <@${slackId}>` : ` session!`}`
                    "text": slackId ? t('review.reviewer.rejected', { slackId }) : t('review.preset.rejected') + `
view session: <https://airtable.com/app4kCWulfB02bV8Q/tbl2q5GGdwv252A7q/viwe3w2MTPRpa9uSB/${sessionId}|here>`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": `undo ${pfps['peefest']}`,
                        "emoji": true
                    },
                    "value": sessionId,
                    "action_id": Actions.UNDO
                }
            },
        ]
    }

    public static rejectedLock(sessionId: string, slackId: string | null = null) {
        return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    // "text": `Rejected and locked ${slackId ? `by <@${slackId}>` : ` session!`}`
                    "text": slackId ? t('review.reviewer.rejectedlocked', { slackId }) : t('review.preset.rejectedlocked') + `
view session: <https://airtable.com/app4kCWulfB02bV8Q/tbl2q5GGdwv252A7q/viwe3w2MTPRpa9uSB/${sessionId}|here>`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": `undo ${pfps['peefest']}`,
                        "emoji": true
                    },
                    "value": sessionId,
                    "action_id": Actions.UNDO
                }
            },
        ]
    }
}