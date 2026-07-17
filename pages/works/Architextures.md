  
Architextures (working title) is an app for organizing the buildings and spaces that inspire you.  
  
The idea is simple. Take a photo of a building, write about what caught your eye, and the app suggests tags for its style, elements, and vibe; accept, reject, or add your own. Over time it becomes a visual journal of what you notice in the world around you!  
  
Architextures is deliberately not a mood board. Pinterest is for collecting what other people made; the point with this app is to curate what *you* stood in front of. This distinction is what shaped the user experience. The app opens to a grid of photos you’ve added to it, and a persistent “+” button that opens the camera. Just in case though, can also import from your camera roll. This means that your library is most likely to be something you saw and chose to keep, not something you scrolled past and maybe saved. Much more intentional.  
  
Three goals shaped it:  
1. **Instant -** Tag suggestions should be instant and reliable.  
2. **Room for the intangible -** You should be able to file a building even when you can't name what it is… only that it speaks to you.  
3. **Photo first -** Home page becomes a gallery of images  
  
And being frank, the other big thing I wanted to achieve out of this app was to learn how to make an app for my iPhone.  
  
At a quick glance, here’s how the app achieves these goals:  
1. **On device - **Every suggestion is generated locally, no round trip to a cloud model or an image search. That buys speed and privacy at the cost of raw model power. This is a trade worth making for something you reach for in the moment.  
2. **“Vibe” is accounted for -** Tags aren't limited to technical terms, and a separate but prominent section for “Vibe” is placed in tag selection. The description box also helps the user expand upon that.  
3. **A grid where the UI stays out of the way -** The home screen is a scrollable, filterable wall of photographs. Images are the primary content to be consumed.  
  
On-device is expectedly, the largest challenge for this app. The app will eventually run 3 sequential frameworks to surface tags: Vision, CreateML, and Foundation Models.  
  
Vision returns ~1,300 identifiers with confidence scores for any image, and most describe the natural world. For a photo of a building, it works extremely fast; unfortunately still says almost nothing useful in my use about architecture other than “Skyscraper” or “Window”. Vision knows the world in general. It does not know architecture in particular. But it’s a decent, high level tag.  
  
That specific knowledge is something I had to build, which is where CreateML slots in. I trained my own classifier on a Kaggle image dataset of architectural styles, so the app can reach for "Art Deco" or "Brutalist" where Vision only sees "building." The model is never really finished: its accuracy is set by the dataset behind it, so the quality of style tagging rests on how well I curate what I feed it. That is slow, and dependent on me the human, to train it. However, it provides more precise architectural elements to tag a photo with.  
  
Foundation Models on iOS 27 is the in-progress, planned third source. With new image support, I’m looking for it to offer a richer semantic read than Vision, surfacing details my own classifier was never trained on, though even then it won't reach true element-level detection. **This isn’t implemented yet.** What is in place is the data model, shaped so it slots in beside Vision and CreateML when it arrives.  
  
**Latency considerations**  
As mentioned, these 3 would run in sequence: Vision first because it is fastest, then CreateML, with Foundation Models joining the same chain once built. Concurrency would be quicker on paper, but plainly, all 3 at the same time would obliterate the RAM and the app would crash on a real device.   
  
The pipeline runs off the main thread, serialized through an actor, so the models take their turn one at a time while the interface stays responsive. The same actor that keeps the UI smooth guarantees only one model is ever resident at once. This latency is where I used the design to hide the compute cost, because as soon as a user says “Use Photos” or hits the Check on import, the models run on all images in that group. As soon as this happens, the user is prompted to write in a title and description. If the user follows this natural flow, there is a natural “View suggestions” pill in the tagging section. Here, as soon as a tag is available, it shows in the count of tag suggestions. That way all potentially useful info for the user is surfaced as soon as it’s ready by the framework.  
This way, the rest of the app is instant and smooth, but heavy compute runs in the background. Just in case a user saves the image before reviewing tags, I keep tag suggestions active for 30 days so they can go back. This is a flow I’m constantly iterating on because the backend compute is something I really do not want the user to be constrained by.   
  
**Data Model**  
Before even prototyping any of the front end, I started with a data model. I find that often times, when I’m prototyping with AI tools, it often makes up a back end that doesn’t REALLY make sense. Too many instances of placeholder text, content, etc. Also, because if I have my data model set in advance, I can populate real images and descriptions into the app, so I build with real data not fake placeholder stuff. I found this to be extremely useful in my day job, and I found it to be relevant here.  
Rather than talk about this in detail, I’ll just post the workflow diagram of the data model, as it is, below:  
  
Note: Design is my favorite part of building anything, so it took a lot of restraint for me to not start on this until I had the data model mostly set.  
  
**Design & Considerations**  
The intention is for the user experience to revolve around the photos and every other element serves them. This made the app’s design simple. The home screen is a masonry grid of every photo in the app. |The detail pages are information about that photo or set of photos. This home page actually helped me learn a great lesson about iOS native app performance optimization because I had initially prototyped the entire app using SwiftUI, and it worked on my iPhone Air. But after reading into how SwiftUI renders large galleries, and some of the performance deficits that LazyGrid rendering faces, I realized I would have to refactor. In simple terms, SwiftUI keeps building new views as you scroll down, and it doesn't reliably reuse the old ones if you scroll back up. So, the memory it uses climbs as a photo gallery gets bigger. UIKit's grid works differently: it keeps a small, fixed set of tiles and recycles them as you scroll, so a library of 200 photos and a library of 20,000 use about the same memory. Clear performance benefit.  
  
Before committing though, I worked the refactor through with Xcode's coding agent, scoping exactly what had to change and what could stay untouched. After confirmation, the home screen was built with UIKit, and the data model, detail views, tag editor, and filter sheets stayed in SwiftUI. UIKit would speak to SwiftUI detail pages via UIViewControllerRepresentable. The change was smaller than it sounds because the scope was generally targeted.   
**UI**  
Another design decision was to have all navigation buttons out of the way as much as possible. This being the navigation bar being split between 2 content menus and a separated and prominent “+” to open the camera. These elements also disappear on scroll down, so they get out of the way to maximize content, but are still accessible. I found this to be a lovely interaction from the native photos app and knew I just had to include it in mine.   
  
The only other elements that take up the home screen are an import button, and a filter button that opens a sheet from the bottom. All of these elements exist to serve either filtering out photos or adding in new ones.  
The detail page also features the photos as much as possible. The description, tags and map cards fill the rest of it out, describing what the user may like about a photo and why it’s special to them.  
  
**Coming Iterations**  
- Foundation Model Support for devices with iOS 27  
- CoreML training for more art styles + interior design elements  
- Search: More natural language search  
  
