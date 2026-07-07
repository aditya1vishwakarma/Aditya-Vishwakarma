import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import {
  Section, Lead, P, H2, H3, Bold, InlineCode,
  List, ListItem, Video, Table
} from '../../components/Writing/Prose';

const DJXProject = () => {
  return (
    <WritingLayout
      title="Keep This Vibe, DJ X"
      category="Product Manager"
      date="March 2026"
      readTime="10 min read"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <Section className="mb-4">
        <Lead>
          How I used the full PM cycle to take a personal frustration, stress-test it with data, prototype a solution, and learn that the honest answer is more useful than the optimistic one.
        </Lead>
      </Section>

      <Video
        src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/djxlockprototype.mov"
        bleed="wide"
        autoPlay
        muted
        loop
        caption="Early, functional, quick-code prototype of how the feature could work."
        className="mt-2 mb-16"
      />

      <Section>
        <H2>The Problem</H2>
        <P>
          You are twenty minutes into a drive. Spotify's DJ X has been nailing it. You have settled into a groove of disco house, everything is clicking, and then you hear it: "Let's switch things up a bit." The energy drops. You go from disco to melancholic rock. The vibe is gone. So you skip. Skip again. After a few songs of trying to recapture the same mood, you leave DJ X entirely and go find a playlist.
        </P>
        <P>
          This happened to me on a number of drives now. And when I asked friends, the reaction was always along the lines of: "Yeah, I hate that."
        </P>
        <P>
          The frustration was real. But frustration alone is not a product. I wanted to know: is this solvable? Would the data support it? And if I built it, would it actually work?
        </P>
      </Section>

      <Section>
        <H2>Why This Problem</H2>
        <P>
          Music is something I care deeply about, and Spotify is something I had used for over a decade. For a project like this, I wanted to work on something I would genuinely want to use or a problem I was actually having. In this case, that meant improving how Spotify's recommendation engine handles continuity. Because sometimes it misses the mark simply by breaking a vibe I didn't want broken.
        </P>
        <P>
          In my experience, something like song radio, for example, leans heavily on my own existing history. Spotify has released features over time that discount personalization, but they aren't particularly easily accessible at the time of this project. The feature I'd want to make would sit at this intersection. Take the existing recommendation engine and allow the user to reign over it for a short, but focused period of time.
        </P>
      </Section>

      <Section>
        <H2>My Approach</H2>
        <P>
          I will also acknowledge upfront that this is a little different from how Spotify PMs would ordinarily operate. Usually the data science team delivers the sophisticated analysis, and PMs shape a feature or product around it. Or vice versa, the PM has an inclination for a feature, and data science helps validate it. For this project, I tackled the entire stack, with Claude as my partner.
        </P>
        <P>
          The dataset I found was a public collection of 8.7 million Spotify tracks with full audio feature metadata: energy, valence (musical positivity), danceability, acousticness, tempo, loudness, and more. Nine features per song, across nearly the entire catalog. It came in SQLite format, which I had genuinely never worked with before. That turned out to be the smallest challenge by far...
        </P>
      </Section>

      <Section>
        <H2>My Hypothesis</H2>
        <P>
          Using the audio features table that assigns a measurable characteristic to every song, I could build a clustering model to group songs and recommend the closest possible "vibe" to a given track. This would later enable a "Keep This Vibe" feature when using DJ X, where one tap locks the system to your current song's vibe. And have the previous songs help guide future recs for the duration of the lock.
        </P>
        <P>
          The formal version: by using high-dimensional audio metadata to create a nearest-neighbors model, we can identify vibe-consistent tracks with higher precision than genre tags alone. Implementing a "Keep This Vibe" toggle in the AI DJ would increase session length and decrease skip rate, as users would no longer need to manually curate their queue to maintain atmospheric consistency.
        </P>
      </Section>

      <Section>
        <H2>Starting With the Data, Not the Solution</H2>
        <P>
          Over my career, I have had to learn the painful lesson of not jumping to a solution first. So I started with a question: do Spotify's audio features contain enough signal to define what "vibe" even means?
        </P>
        <P>
          Before building anything, I needed to understand the data. What does a typical song look like? Which features actually differentiate songs from each other? Are there meaningful clusters, or is the feature space just noise? Only by knowing this could I accurately gauge vibe. This statistical analysis phase ended up being the most important step in the entire project.
        </P>

        <H3>Data Cleaning</H3>
        <P>
          The raw dataset had 8,740,043 tracks. Before analysis, I ran a cleaning pass:
        </P>
        <List>
          <ListItem><Bold>Loudness clamping.</Bold> The raw data had a max loudness of 6.28 dB, which is physically impossible for digital audio. All values above 0 dB were clamped.</ListItem>
          <ListItem><Bold>Extraction failure filtering.</Bold> 34,764 tracks had a tempo of zero. 34,979 had a time signature of zero. These are artifacts of Spotify's audio analysis pipeline failing on certain tracks, not actual musical properties. All were removed.</ListItem>
        </List>
        <P>
          Total records dropped: 34,979 (0.40% of the dataset). That left 8,705,064 pristine tracks for analysis. A small price to prevent zero-value tracks from skewing vector distances downstream.
        </P>
      </Section>

      <Section>
        <H2>What the Data Told Me</H2>
        <H3>
          Phase 0: Understanding The 9 dimensions
        </H3>
        <Table
          dimensions="10x2"
          header
          data={[
            'Dimension', 'What It Measures',
            'Energy', 'How intense the song feels. A quiet acoustic ballad scores low. A metal track scores high.',
            'Valence', 'How positive or happy the song sounds musically. A major-key, upbeat pop song scores high. A minor-key, somber ballad scores low.',
            'Danceability', 'How easy it is to dance to, based on tempo stability, beat strength, and rhythm regularity.',
            'Acousticness', 'How acoustic (vs. electronic/produced) the song sounds.',
            'Tempo', 'Beats per minute. Literally how fast the song is.',
            'Loudness', 'Average volume level in decibels.',
            'Speechiness', 'How much of the track is spoken words vs. singing or instruments.',
            'Instrumentalness', 'Whether there are vocals at all. High instrumentality means no vocals.',
            'Liveness', 'Whether the track sounds like it was recorded live with an audience.',
          ]}
        />
        <p>
          These features are determined by Spotify's crack data science team and for every song!
        </p>
        <H3>Phase 1: The Feature Space</H3>
        <P>
          The first question was basic: do Spotify's audio features actually mean anything?
        </P>
        <P>
          Every single audio feature significantly predicts genre (ANOVA, p close to 0 for all nine). Classical music has a distinct audio fingerprint from hip-hop, which looks different from electronic, which looks different from rock. If the features were noise, the entire concept would have been dead on arrival. They are not.
        </P>
        <P>
          The distributions told me what "normal" looks like. Danceability, energy, and valence are healthy bell curves centered around 0.5. Speechiness is severely right-skewed, with almost all songs near zero. That makes sense: most music is singing, not spoken word. Instrumentalness is bimodal. Songs are either vocal or instrumental, rarely in between. These shapes matter because they tell you which features will actually differentiate songs and which are just background noise.
        </P>
        <P>
          The correlation analysis revealed structure. Energy and loudness are tightly linked (r = +0.79). Acousticness and energy are inversely correlated (r = -0.75). These three form an "intensity" cluster: they are partially redundant. But most other features are fairly independent, meaning each one adds unique information to the vibe vector. Danceability and valence have a moderate positive correlation, which makes intuitive sense: danceable songs tend to be happier.
        </P>
        <P>
          PCA confirmed this: five principal components capture roughly 82% of the variance, with a clear "intensity" axis (PC1) and a "mood" axis (PC2, driven by valence and danceability).
        </P>
        <P>
          The most important output: ranking features by importance. The top three were valence, acousticness, and danceability. These are perceptual features. They map to how a song <em>feels</em>, not just how it sounds. This directly informed the weighting scheme: give the "feel" features more influence in similarity calculations.
        </P>

        <H3>Implications for the Model</H3>
        <P>
          The statistical findings point to the following pretty clearly:
        </P>
        <List>
          <ListItem><Bold>Use all 9 continuous dimensions.</Bold> Low inter-correlation means each adds unique signal.</ListItem>
          <ListItem><Bold>Perceptual weighting makes sense.</Bold> Valence, energy, and danceability are the most vibe-relevant features, so they should carry more weight.</ListItem>
          <ListItem><Bold>StandardScaler is necessary.</Bold> StandardScaler is [ ... ]Loudness ranges from -60 to 0 dB while danceability ranges from 0 to 1. Without normalization, loudness would dominate every 'distance' calculation.</ListItem>
          <ListItem><Bold>Genre can validate but cannot replace audio features.</Bold> 70% of artists in the dataset lack genre tags entirely.</ListItem>
        </List>

        <H3>Phase 2: Proving Similarity Search Works</H3>
        <P>
          Knowing the features carry signal is not the same as knowing you can search by similarity at scale. I built a 12-dimensional vibe index across all 8.7M tracks and stress-tested it.
        </P>
        <P>
          <Bold>The vibe space is dense and well-behaved.</Bold> The median nearest-neighbor distance is just 0.066. At rank 20, the median distance is still only 0.177. For any given anchor song, 341 tracks fall within a tight similarity radius. The candidate pool is rich, not thin. This was the first real validation that the feature could work. If a user locks a vibe, the system would have hundreds of strong candidates to draw from.
        </P>
        <P>
          <Bold>Similarity is holistic, not one-dimensional.</Bold> When I examined the nearest neighbors visually, they matched the anchor across all features, not just one or two. The index is not finding "same tempo." It is finding genuinely similar vibes.
        </P>
        <P>
          <Bold>Genre is irrelevant, by design.</Bold> Genre coherence is flat at roughly 10% across all distance thresholds. This is actually the correct behavior. A chill bossa nova track and a chill indie folk track should match on vibe even though they are different genres. The vibe space captures how music feels, not what category it is filed under.
        </P>
        <P>
          <Bold>Cross-vibe separation works.</Bold> "Friday" (energy = 0.86) and "everything i wanted" (energy = 0.22) sit at the same roughly 120 BPM but have zero neighborhood overlap. The system correctly separates tracks that share surface-level features but feel completely different. The overall signal-to-noise ratio is strong: vibe-matched tracks are 28.9x closer than random pairs (Cohen's d = 4.66).
        </P>
        <P>
          One key product question answered by this phase: can a user lock after just one song? Yes. The density guarantees hundreds of high-quality candidates for any single anchor. At low confidence, the system stays permissive. It will not reject good matches, and it will not stall.
        </P>
      </Section>

      <Section>
        <H2>What I Knew It Could Not Do</H2>
        <P>
          I went into this with specific intuitions, and I want to be honest about where they hit a wall.
        </P>
        <P>
          K-Means clustering served as a reasonable backbone for the project, but it has deep limitations for production-scale implementation. There is no user signal in this dataset. The most critical issue I stumbled on early is that there really is no objective way to define what a "lockdown" of vibe would be. In future iterations, user signals like skips during a locked session would get fed into machine learning models to better define what "vibe" really means. I am sure data teams at streaming services are already working on this.
        </P>
        <P>
          The audio features alone cannot capture instrumentation, production style, vocals, lyrics, cultural era, or tempo feel. A 120 BPM EDM song feels entirely different from a 120 BPM bossa nova song. A Bach cello performance and an ambient electronic track can have extremely similar vectors: 0.1 on energy, 0.8 on acousticness, 0.3 on valence. But no one would say they are the same vibe.
        </P>
        <P>
          There is also deeper subjectivity involved with the word "vibe" itself. That is precisely why this project is a product proposal, not just a data project. The data gives us a foundation. The product design has to account for what the data cannot see.
        </P>
      </Section>

      <Section>
        <H2>From Data to Product</H2>
        <P>
          With the data foundation validated, I wrote a full PRD for a feature called "Keep This Vibe."
        </P>
        <P>
          The concept is simple: one tap to lock DJ X to your current groove. The system reads your recent listening behavior, computes a vibe anchor, and constrains future recommendations to stay within that space. When the lock expires, it fades out gradually. No jarring transition.
        </P>
        <P>
          The key product decisions, all informed by the data:
        </P>
        <List>
          <ListItem><Bold>Session-aware anchoring.</Bold> Short sessions (fewer than 5 songs) use the most recent track. Longer sessions compute a weighted centroid. The data showed that vibe space is continuous, not clustered, so a centroid approach works better than trying to snap to discrete moods.</ListItem>
          <ListItem><Bold>Confidence-adjusted thresholds.</Bold> Consistent sessions get tight recommendations; exploratory sessions stay loose. This came directly from the distance distribution analysis. The median nearest-neighbor distance is just 0.07, but the 95th percentile is 0.31. That range matters.</ListItem>
          <ListItem><Bold>Genre as a soft boost, not a filter.</Bold> Genre coherence in the similarity index is roughly 10%, low by design. A genre match gets a small similarity bonus, but nothing gets excluded.</ListItem>
          <ListItem><Bold>Skip-rate monitoring.</Bold> If a user starts skipping 70% or more of locked recommendations, the system asks "Still vibing?" rather than stubbornly continuing. The data showed that some listening patterns, focus work and drifting exploration in particular, do not respond well to vibe locking at all.</ListItem>
          <ListItem><Bold>Gradual timer expiry.</Bold> The last three songs before the lock expires gradually widen the recommendation space. The user gets offered a one-tap extension. No hard cutoff.</ListItem>
        </List>
        <P>
          The target audience for V1 is specific: high-energy sessioners. Workouts, parties, drives, any context where energy consistency matters most. The data clearly showed these users benefit the most. Deep focus users are explicitly excluded from the V1 target because the data showed the feature actively hurts them.
        </P>
      </Section>

      <Section>
        <H2>The Problem I Could Not Solve With Data Alone</H2>
        <P>
          The engineering works. 0.32ms query latency across 8.7M tracks, 7x genre coherence over random, 29x distance separation between vibe-matched and random pairs.
        </P>
        <P>
          But I could not answer the most important question: does it actually help users listen longer?
        </P>
        <P>
          I do not have users. I do not have real skip and listen behavior. So I built a synthetic session simulator with five behavioral personas: the chill driver, the party host, the deep focus worker, the genre explorer, and the vibe drifter. 10,000 sessions. 800,000 events. Each persona with different skip tolerances, noise factors, and drift patterns.
        </P>
        <P>
          This is where intellectual honesty became the most important product skill.
        </P>
      </Section>

      <Section>
        <H2>The Results I Almost Got Wrong</H2>
        <P>
          My first evaluation showed a +2.1 average listen lift and 59% of sessions helped. It looked like a clear win.
        </P>
        <P>
          Then I audited the methodology and found three structural biases:
        </P>
        <List type="numbered">
          <ListItem><Bold>The counterfactual was a straw man.</Bold> My "DJ X without vibe lock" model drifted recommendations 5 to 12x farther than the nearest neighbor, guaranteeing the alternative would always look worse. I replaced it with realistic DJ behavior: gradual energy ramps and genre hops with bounded shifts.</ListItem>
          <ListItem><Bold>The evaluation was tautological.</Bold> Skip decisions were a pure function of angular distance, the same metric the lock optimizes. Of course the lock won. I added noise factors (10 to 22% random skip/listen flips) to simulate non-vibe reasons people skip: unfamiliar artist, wrong lyrics, mood shift.</ListItem>
          <ListItem><Bold>Confidence ignored skip rate.</Bold> A session with 90% skips could still show high confidence if the 10% of listens happened to be similar. I added a skip-rate penalty.</ListItem>
        </List>
        <P>
          After fixing all three: <Bold>+0.3 average listen lift. 49% of sessions helped.</Bold> Essentially break-even.
        </P>
        <P>
          But the breakdown by persona told a clearer story:
        </P>

        {/* Data table — kept as raw HTML since table structure is unique per use case */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-left text-sm whitespace-nowrap bg-moss/5 rounded-squircle border border-moss/10 overflow-hidden">
            <thead className="uppercase tracking-wider border-b border-moss/10 bg-moss/10 text-charcoal/80 font-bold">
              <tr>
                <th scope="col" className="px-6 py-4">Persona</th>
                <th scope="col" className="px-6 py-4">Listen Lift</th>
                <th scope="col" className="px-6 py-4">% Helped</th>
              </tr>
            </thead>
            <tbody className="text-charcoal/70 text-base">
              <tr className="border-b border-moss/5">
                <td className="px-6 py-4">Party host</td>
                <td className="px-6 py-4 font-bold">+3.3</td>
                <td className="px-6 py-4 font-bold">77%</td>
              </tr>
              <tr className="border-b border-moss/5">
                <td className="px-6 py-4">Genre explorer</td>
                <td className="px-6 py-4">+0.9</td>
                <td className="px-6 py-4">62%</td>
              </tr>
              <tr className="border-b border-moss/5">
                <td className="px-6 py-4">Chill driver</td>
                <td className="px-6 py-4">+0.1</td>
                <td className="px-6 py-4">59%</td>
              </tr>
              <tr className="border-b border-moss/5">
                <td className="px-6 py-4">Vibe drifter</td>
                <td className="px-6 py-4">-0.6</td>
                <td className="px-6 py-4">47%</td>
              </tr>
              <tr>
                <td className="px-6 py-4">Deep focus</td>
                <td className="px-6 py-4 font-bold">-2.2</td>
                <td className="px-6 py-4 font-bold">36%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <P>
          Party-style users with narrow, consistent preferences and high energy benefit significantly. Deep focus users are hurt by the lock because they skip for reasons that have nothing to do with vibe: lyrics, vocals, familiarity. The feature is not universally good. It is good for a specific segment.
        </P>
        <P>
          That finding directly shaped the PRD. V1 targets high-energy sessioners explicitly, excludes deep focus users, and includes an experiment design to validate with real users before broader rollout.
        </P>
      </Section>

      <Section>
        <H2>Why I Would Vouch for This Feature</H2>
        <P>
          The core is solid. The vibe similarity index works at scale. The product design adapts to session context. The lifecycle handles all the edge cases: early locks, taste drift, timer expiry, graceful transitions. With UX and UI refinement from a design team, this feature has legs.
        </P>
        <P>
          My market research and user interviews support a feature like this existing in Spotify. I found independent corroboration on Spotify's own community forum: a user submitted a feature request titled "Keep the vibe button for AI DJ," describing the exact same problem and proposing a nearly identical solution. The people yearn for continuous vibes.
        </P>
        <P>
          The data tells me where to aim. Party-style and driving sessions are the sweet spot. The data also tells me where to pull back: focus users and habitual drifters. That segmentation is the difference between shipping something that works for everyone 49% of the time and shipping something that works for the right users 77% of the time.
        </P>
      </Section>

      <Section>
        <H2>What I Would Do Next</H2>
        <P>
          The honest answer is that synthetic data can validate mechanics but not impact. The critical next step is a small A/B test. Even 1,000 users over one week would provide ground truth that no simulation can replicate.
        </P>
        <P>
          Beyond that:
        </P>
        <List>
          <ListItem><Bold>Collaborative filtering.</Bold> "Users who locked on this vibe also liked..." would dramatically improve locked recommendations over pure audio similarity.</ListItem>
          <ListItem><Bold>Personalized thresholds.</Bold> The current base threshold is a global default. Real calibration would learn per-user optimal thresholds from their historical skip distributions.</ListItem>
          <ListItem><Bold>Deeper embeddings.</Bold> Solving the bossa nova problem, where two songs share identical audio features but feel completely different, requires richer signal than nine numerical features can provide.</ListItem>
          <ListItem><Bold>Spotify's internal features.</Bold> Mood tags, activity tags, editorial playlists, and the social graph would all improve the vibe lock far beyond what raw audio features can achieve.</ListItem>
        </List>
      </Section>

      <Section>
        <H2>The Takeaway</H2>
        <P>
          The PM cycle is not about proving your intuition right. It is about stress-testing it fast enough to build the right thing, or to learn why you should not build it at all.
        </P>
        <P>
          Data analysis was not a checkbox in this project. It was the step that turned a hunch ("DJ X switches vibes too much") into a defensible product bet ("audio features contain 5 to 6 dimensions of vibe signal, similarity search works at scale, and party-style users are the right V1 target"). Without it, I would have designed a feature for everyone and discovered, much later and much more expensively, that it only works for some.
        </P>
        <P>
          The v1-to-v2 correction was the most valuable moment in the project. Not because it changed the answer, but because it forced the right question: is this feature actually good, or does my evaluation just make it look good? That is the question every PM should be asking before they ship.
        </P>
      </Section>

    </WritingLayout>
  );
};

export default DJXProject;
