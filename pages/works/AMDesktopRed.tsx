import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Quote, Img } from '../../components/Writing/Prose';

const AMDesktopRed = () => {
    return (
        <WritingLayout
            title="Apple Music Desktop 'Redesign'"
            category="Un-Selected Works"
            backLink={{ path: '/works', label: 'Back to Works' }}
        >
            <Section>
                <p className="mt-12">
                    At the time, in March 2025, I was learning design and also importing some live sets onto my iPhone when I noticed how antiquated the Apple Music Desktop App at the time was. This sparked an interest to re-do the desktop app with more modern iOS 18 design principles.
                </p>
                <Img
                    src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/AM%20Home%20Page.jpg"
                    alt="A screenshot of the direction I was heading towards for the redesign."
                    bleed="full"
                    caption="Redesigned home page of my Apple Music Desktop App"
                />
                <p> The intention of the redesign was to introduce more visual flair to the desktop app, while still remaining true to Human Interface Guidelines. I was obsessed with VisionOS at the time, and wanted to utilize its design system to revamp the music expeirence.</p>
            </Section>
            <Section>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                        src="https://embed.figma.com/proto/HM4War2aWLnx0LXLlfVrdJ/Apple-Music-Redesign?node-id=197-571&viewport=-537%2C149%2C0.52&scaling=scale-down-width&content-scaling=fixed&page-id=56%3A189&embed-host=share"
                        allowFullScreen
                    />
                </div>
            </Section>
            <p> The redesign would have a reactive media player bar, that changed color based on the album art of the current song. Just like in iOS, thus introducing more design continuity across platforms.</p>

        </WritingLayout >
    );
};

export default AMDesktopRed;
