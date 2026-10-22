import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import * as Prose from '../../components/Writing/Prose';
const { Section, Lead, P, H2, Bold, List, ListItem, InlineCode, MediaGallery } = Prose;

const LocallyHostedApps = () => {
  return (
    <WritingLayout
      title="Locally Hosting Apps"
      category="Self-Hosting"
      date="October 2026"
      readTime="2 min read"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <Section>
        <Lead>
          This is an ongoing process and learning, and at the time of writing this post, October 2026, I've only just started the journey!
        </Lead>
      </Section>

      <Section>
        <P>
          I recently decided to foray into locally hosted apps because a while ago, I bought a NAS. The original intention was to have a place to store photos outside of iCloud, because I am a photographer and RAW photos take like 56mb per photo. It's starting to get unruly for iCloud even on the 2TB plan. I also knew that I'd want to set up NAS software that would be independent and not proprietary, mainly for security reasons as well as realizing that companies are moving to proprietary things like drives (Synology) and software. For a self hosting environment, I feel like that's not something I'd want. I found out that there's a whole open source community for local hosting when I found out about TrueNAS.
        </P>
      </Section>

      <Section>
        <H2>TrueNAS</H2>
        <P>
          TrueNAS is an open-source Linux-based operating system that allows users to build and manage their own servers. Compared to proprietary software like Synology, UGreen, or Buffalo, it is a lot more robust for storing, sharing, and protecting files. Since it's open source, I have a lot more trust that there are also no hidden backdoors in the software to access my data.
        </P>
        <P>
          TrueNAS also has a great ecosystem of apps, and the beauty of it is, I can install my own custom apps as well! This fits really well into me being really comfortable using Claude to whip up apps.
          {/* TODO: finish this sentence — "I don't need to find a way to …" */}
        </P>
      </Section>

      <Section>
        <H2>Why not something like Vercel?</H2>
        <List type="numbered">
          <ListItem><Bold>No need —</Bold> These are usually really really light and basic apps. (See drawing calendar below)</ListItem>
          <ListItem><Bold>Privacy —</Bold> Personal data remains personal.</ListItem>
          <ListItem><Bold>Why not —</Bold> I have the machine already, and the capability, so why not!</ListItem>
        </List>
      </Section>

      <Section>
        <H2>Getting to it from anywhere</H2>
        <P>
          Accessing my server when I'm not on my home network is also super simple. Thanks to advice from a friend, I run my own DNS as well via Pi-Hole. I set up sites/domains like <InlineCode>draw.home</InlineCode> for the drawing app, point it to my NAS. And then, I use Tailscale, which is a private network that helps link my devices. So anytime I'm on my Tailscale network, and I go to <InlineCode>draw.home</InlineCode> it routes me to my app!
        </P>
      </Section>

      <Section>
        <H2>Drawing Calendar</H2>
        <P>
          Just as an example, here's a simple app I created in an evening to help me keep track of my drawing practice. This is a good example of the perfect self-hosted app. It's super light and 'inconsequential' so I can just keep it running on my local server. I find that it was easier to create the app on this via just TypeScript than do the entire thing on iOS like I did with Placemarks.
        </P>

        {/* Paste CDN links into `items`. Each entry: { src, alt, caption? } — add type: 'video' for clips. */}
        <MediaGallery
          bleed="wide"
          orientation="landscape"
          align="start"
          items={[
            {
              src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/DrawingCal.avif',
              alt: 'Draw.Home Home Page View',
              caption: 'Home Page',
            },
            {
              src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/Stopwatch.avif',
              alt: 'Stop Watch View',
              caption: 'Stop Watch or Timer',
            },
            {
              src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/Art%20Practice%201.avif',
              alt: 'Journal Entry View',
              caption: 'Journal Entry',
            },
          ]}
          caption="draw.home."
        />
      </Section>
    </WritingLayout>
  );
};

export default LocallyHostedApps;
