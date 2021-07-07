---
pageTitle: "New Site, Same Great Content"
---

Gotta love that new site smell. For the longest time I was hosting my site on a Wordpress instance on AWS. It worked, but not the way I wanted it to. I spent way too much time focusing on keeping the servers running and everything updated and way too little time focusing on the content. 

So earlier this year I started looking for a better way. I wanted something simple that I could express as code. Something that would be fast, efficient, and less costly while not sacrificing the way I wanted to write content. 

After a long time and a lot of trial and error I have a new content workflow that is an utter pleasure to work with and leaves me focused on building the decks I want to share instead of updating EC2 instances. I'm now writing entirely in [plain text markdown](https://daringfireball.net/projects/markdown/syntax) and using the [11ty static site generator](https://www.11ty.dev/) to generate a simple yet functional layout for my content. I'm then using simple [github](https://github.com/) integrations to automatically deploy the site to [netlify](https://www.netlify.com/) for hosting every time I push. 

The whole process took a ton of work to get up and running, but every moment was worth it. Once you start browsing around the site you'll notice a new improved layout, easy to navigate interface, and much improved deck layouts. 

{% deck "Example Deck" %}

12 Plains

12 Island

12 Swamp

12 Mountain

12 Forest

{% enddeck %}

All automated for me through a few simple pieces of markup. I write plain text, I get a beautiful blog. 

The site is also faster, loads almost instantly, and is available via [my github](https://github.com/mrbiggbrain/ArenaDecks.com). 

