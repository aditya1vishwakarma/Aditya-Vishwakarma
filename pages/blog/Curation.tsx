import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Lead, Quote, P, H2, List, ListItem } from '../../components/Writing/Prose';

const Curation = () => {
  return (
    <WritingLayout
      title="Curation is the best skill anyone can have."
      date="Random Note, 2025"
      readTime="4 min read"
      category="Random Thoughts"
    >
      <Section>
        <Lead>
          You’ll find that a lot of my writing and random thoughts are more about the abstract or philosophical, and the “I”. The following is no different.
        </Lead>
        <P>
          I make playlists. A lot of playlists. And over time, I have curated dozens of hyper specific to me playlists that I like. And this raised a natural question, that I’m attempting to think about. Things like:
        </P>
        <List type="numbered">
          <ListItem>What is curation?</ListItem>
          <ListItem>What does what I’ve curated convey about me? What was I feeling?</ListItem>
          <ListItem>Did I curate something ‘organically’? Or is it algorithmic? Am I OK if it’s algorithmic?</ListItem>
          <ListItem>What is algorithmic curation? Can I really call it ‘curation’ if I’m not thinking about something organically?</ListItem>
        </List>
        <P className="mb-0">
          The following is an attempt to scatterbrain answer the questions above.
        </P>
      </Section>

      <Section>
        <H2>What is Curation?</H2>
        <P>
          Put simply, it’s the act of collection. And either to share a collection, or keep it for oneself. Usually collecting things based on a specific interest, point of view, etc. that help you create something new.
        </P>
        <P>
          What it does for me is it hones my style, my interests, allows me to find more of what I like, because that helps me ultimately understand myself better.
        </P>
        <P>
          This also I guess can lead to understanding others as well! Seeing what others curate and my internal reactions to it help me understand the other. It’s also a great measure of to me of their creative capacity.
        </P>
        <P>
          When I look at someone I can get a sense of their creative prowess by what they curate and share. Curation is essentially selection. To me, it’s a sign of intention. I like this thing, and this other thing, and I think they go well together and here’s why. The inverse is also true. These things ought to work together but don’t, and here’s why. The act to curate is an act or an effort to understand myself. That’s why I’ve been thinking about the idea of the algorithmic curation.
        </P>
        <P>
          The reason is because curation takes time and effort. It takes hard work to find what you like and don’t like. And as I’ve learned over the years, a willingness to change your mind. A lot. And be okay with it. My interests will change, time will pass, but I’ll become better for it is the mindset I try to live with. But with the <em>Algorithm™</em> it’s kind of outsourced. All of the thought the time spent is outsourced based on metrics of what you interact and engage with on a given platform. My question then becomes: Is it amplifying what I like and showing me more? Or am I tricking myself into thinking I like something just because it was engaging. And I think the answer is somewhere in the middle. It’s a lot less effort to just view a video and like it, which will feed you dozens of videos just like that one. But If it’s like a book, it’s longer format, I will try to find more books like that but I have 300-800 pages of time sunk to really understand what I liked about a book.
        </P>
        <P>
          Another tangential point is the whole quote picasso has about stealing.
        </P>

        <Quote>"Good artists copy, great artists steal" by Piccaso.</Quote>

        <P>
          To me, the core of this message is not that you have to be extremely original, or you have to copy others work. It's more that we don't put enough emphasis on what "steal" means.
        </P>

        <Quote>
          Stealing is curation. I'm going to live my life consuming things, forming opinions about them, and one day, if I'm lucky enough to make something truly of my own. I'm going to draw from those inpirations. These are not things that I explicitly made, but are things I want to combine with other things I like.
        </Quote>

        <P>
          Another skill that is ancillary to curation is discrimination (used in the sense of judgement or making distinctions): Determining what is good and what is not.
        </P>
        <P>
          Really small example but a way I practice curation on a daily basis is simply by listening to music. Music is a huge part of my life. It’s my mood regulator, my thought amplifier, and my way to interpret time. I will curate playlists based on what my mood was when traveling through a city, or more importantly, around a certain vibe or feeling.
        </P>
        <P>
          I’m really. making a playlist for myself, so I make a playlist centered around my thoughts and emotions. If people who listen to it think it’s great, then that’s just a bonus. This for the record is one of the biggest positives of moving off of Spotify for me. I’m not constantly cognizant of the fact that others may be able to see my playlist (even though you can set playlists to be private). I don’t feel the need to make sure everything is perfect on Apple Music, the social features are just not there compared to Spotify, so in almost isolation I can find what I like and don’t.
        </P>
        <P className="mb-0 italic">—Unfinished.</P>
      </Section>
    </WritingLayout>
  );
};

export default Curation;
