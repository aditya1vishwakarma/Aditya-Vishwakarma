import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Quote, P, Callout, Bold } from '../../components/Writing/Prose';

const Nostalgia = () => {
    return (
        <WritingLayout
            title="The Curse of Nostalgia"
            date="Random Note, 2025"
            readTime="1 min read"
            category="Random Thoughts"
            backLink={{ path: '/blog', label: 'Back to Journal' }}
        >
            <Section>
                <Quote>Nostalgia is probably the most potent and dangerous feeling we have.</Quote>
                <P>
                    A sense of longing for a past time, our minds completely manipulate reality of that time to something it wasn't. The present is lame. We want out. I think that has to do with a realization that we live our lives by what the algorithm tells us.
                </P>
            </Section>

            <Callout bleed="wide">
                <P className="mb-6">
                    <Bold>Porter Robinson</Bold> covers this in SMILE - "some people die of nostalgia"
                </P>
                <P className="mb-6">
                    <Bold>Coldplay</Bold> - Glass of Water - "Don't ask, neither how full nor empty is your glass. Cling… To the mast… Spend your whole life living in the past… Going nowhere fast"
                </P>
                <P className="mb-0">
                    <Bold>Midnight in Paris</Bold> covers this - "The present is always a little unsatisfying"
                </P>
            </Callout>

            <P>
                People have completely exhausted nostalgia from 2010 to 2020. Now we're moving back to exhausting nostalgia from 2000-2010. Then we'll continue moving back to 1990-2000. We just can't get enough. This cycle repeats again, and again, and again.
            </P>

            <P className="mb-0">
                I feel like there's been no big design or cultural movements since 2020. Everyone lives trying to recapture a different time. Everything is short term and money motivated. No real risk is taken in design nor do people try to take risks. It upsets EPS.
            </P>
        </WritingLayout>
    );
};

export default Nostalgia;