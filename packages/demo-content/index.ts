import { readFileSync, writeFileSync } from 'fs'

import * as Campsite from '@campsite/types'

// Amber and Hazel are not confirmed users; don't assign anything to them
type UserKey = Exclude<keyof typeof users, 'Amber Glade' | 'Hazel Nutt'>
type User = {
  avatar_path?: string
  internal_description?: string
}

type ProjectKey = keyof typeof projects | 'General'
type Project = Pick<Campsite.Project, 'accessory' | 'description'> & {
  is_default?: boolean
  archived?: boolean
  private?: boolean
  members?: UserKey[]
  favorites?: UserKey[]
}

type Reaction = Pick<Campsite.Reaction, 'content'> & {
  user: UserKey
}

type Attachment = {
  file_path: string
  file_type: string
  width: number
  height: number
}

type Post = Pick<Campsite.Post, 'description_html'> & {
  author?: UserKey
  oauth_provider?: 'zapier'
  project: ProjectKey
  reactions?: Reaction[]
  comments?: Comment[]
  attachments?: Attachment[]
  unfurled_link?: string
  title?: string
  poll?: {
    options: {
      description: string
      votes: UserKey[]
    }[]
  }
}

type Comment = Pick<Campsite.Comment, 'body_html'> & {
  user?: UserKey
  oauth_provider?: 'zapier'
  reactions?: Reaction[]
  replies?: Omit<Comment, 'replies'>[]
}

type ThreadMessage = Pick<Campsite.Message, 'content'> & {
  user?: UserKey
  oauth_provider?: 'zapier'
  reactions?: Reaction[]
}

type Thread = {
  title?: string
  image_path?: string
  owner: UserKey
  members: UserKey[]
  messages: ThreadMessage[]
  favorites?: UserKey[]
}

type Note = Pick<Campsite.Note, 'title' | 'description_html' | 'public_visibility' | 'project_permission'> & {
  project?: ProjectKey
  description_schema_version: number
  member: UserKey
  comments?: Comment[]
}

type Call = {
  generated_title: string
  peers: UserKey[]
  recordings: {
    file_path: string
    transcription_vtt: string
    size: number
    duration: number
    max_width: number
    max_height: number
    summary_sections: {
      section: 'summary' | 'agenda' | 'next_steps'
      response: string
    }[]
  }[]
}

// store long HTML in separate files to keep this file readable
function getFile(path: string) {
  return readFileSync(path, 'utf8')
}

const users = {
  'Ranger Rick': {
    avatar_path: 'o/dev-seed-files/avatar-ranger-rick.png',
    internal_description: 'owner'
  },
  'Brooke Rivers': {
    avatar_path: 'o/dev-seed-files/avatar-brooke-rivers.png',
    internal_description: 'special projects'
  },
  'Cliff Rockwell': {
    avatar_path: 'o/dev-seed-files/avatar-cliff-rockwell.png',
    internal_description: 'security'
  },
  'Daisy Meadows': {
    avatar_path: 'o/dev-seed-files/avatar-daisy-meadows.png',
    internal_description: 'landscaping'
  },
  'Willow Carter': {
    avatar_path: 'o/dev-seed-files/avatar-willow-carter.png',
    internal_description: 'finance'
  },
  'Sierra Peaks': {
    avatar_path: 'o/dev-seed-files/avatar-sierra-peaks.png',
    internal_description: 'safety'
  },
  'Reed Marsh': {
    avatar_path: 'o/dev-seed-files/avatar-reed-marsh.png',
    internal_description: 'maintenance'
  },
  'Autumn Hayes': {
    avatar_path: 'o/dev-seed-files/avatar-autumn-hayes.png',
    internal_description: 'education'
  },
  'Sage Woods': {
    avatar_path: 'o/dev-seed-files/avatar-sage-woods.png',
    internal_description: 'people'
  },
  'Misty Vale': {
    avatar_path: 'o/dev-seed-files/avatar-misty-vale.png',
    internal_description: 'visitors'
  },
  'Sunny Fields': {
    avatar_path: 'o/dev-seed-files/avatar-sunny-fields.png'
  },
  'Hunter Cooper': {
    avatar_path: 'o/dev-seed-files/avatar-hunter-cooper.png'
  },
  'Hazel Nutt': {
    avatar_path: 'o/dev-seed-files/avatar-hazel-nutt.png',
    internal_description: 'invitee'
  },
  'Amber Glade': {
    avatar_path: 'o/dev-seed-files/avatar-amber-glade.png',
    internal_description: 'membership_requests'
  }
} satisfies Record<string, User>

const assignableUsers = {
  ...users
}
// @ts-ignore
delete assignableUsers['Amber Glade']
// @ts-ignore
delete assignableUsers['Hazel Nutt']

const projects = {
  'Park Rangers': {
    private: true,
    description: null,
    accessory: '🤠',
    members: ['Ranger Rick', 'Brooke Rivers'],
    favorites: ['Ranger Rick', 'Brooke Rivers']
  },
  'Maintenance Requests': {
    description: null,
    accessory: '🔧',
    members: ['Reed Marsh']
  },
  'Trail Reports': {
    is_default: true,
    description: null,
    accessory: '🗺️',
    favorites: ['Ranger Rick', 'Brooke Rivers', 'Reed Marsh', 'Sage Woods']
  },
  'Grant Writing': {
    accessory: '💰',
    description: 'Resources and tips for grant writing.',
    members: ['Ranger Rick', 'Willow Carter', 'Sunny Fields', 'Autumn Hayes']
  },
  'PR & Media Relations': {
    description: null,
    accessory: '📰',
    members: ['Ranger Rick', 'Brooke Rivers']
  },
  '2024 Budget Planning': {
    description: null,
    accessory: '💸',
    members: ['Ranger Rick']
  },
  'Photo Stream': {
    is_default: true,
    accessory: '🌄',
    description: 'Share your favorite park photos!',
    members: ['Misty Vale']
  },
  'Staff Lounge': {
    is_default: true,
    accessory: '🍕',
    description: 'A place to chat about non-work stuff.',
    members: [],
    favorites: ['Ranger Rick', 'Daisy Meadows', 'Sunny Fields']
  },
  'Gear Talk': {
    accessory: '🥾',
    description: null,
    members: ['Ranger Rick']
  },
  '2023 Annual Report': {
    description: null,
    accessory: '',
    members: ['Ranger Rick'],
    archived: true
  },
  Reservations: {
    description: 'View latest campground reservations.',
    accessory: '📅',
    members: ['Ranger Rick', 'Misty Vale', 'Reed Marsh', 'Daisy Meadows']
  }
} satisfies Record<string, Project>

const posts = {
  redwood_path_trail_map_feedback: {
    author: 'Ranger Rick',
    project: 'General',
    title: 'Redwood Trail & campground map feedback',
    description_html:
      "<p>I had a chance to test out the new map for the Redwood Trail this weekend. Wanted to share a few thoughts:</p><ul><li><p><strong>Clarity</strong>: The new legend is much easier to understand. The symbols are intuitive!</p></li><li><p><strong>Route Colors</strong>: Love the color-coding for difficulty levels. It's a great quick reference for visitors.</p></li><li><p><strong>Material</strong>: The waterproof material is a game-changer, especially in unpredictable weather.</p></li></ul><p>Perhaps we could add a few more landmarks for better orientation. Overall, it's a fantastic update!</p>",
    comments: [
      {
        user: 'Autumn Hayes',
        body_html: "<p>Thanks for the feedback! I'll make sure to pass this along to the design team.</p>"
      },
      {
        user: 'Sage Woods',
        body_html:
          "<p>I agree, the new map is a huge improvement. I'm glad to see the team is taking visitor feedback into account!</p>"
      }
    ],
    attachments: [
      {
        file_path: 'o/dev-seed-files/sd-park-map-3.png',
        file_type: 'image/png',
        width: 1344,
        height: 768
      },
      {
        file_path: 'o/dev-seed-files/sd-park-map-4.png',
        file_type: 'image/png',
        width: 1344,
        height: 768
      }
    ]
  },
  staff_lounge_get_together: {
    author: 'Cliff Rockwell',
    project: 'Staff Lounge',
    title: 'Old Pine Tavern this Friday 🍻🍕',
    description_html:
      "<p>For anyone interested in unwinding after a busy week on the trails… we're planning a casual get-together at The Old Pine Tavern this Friday. Feel free to join in and bring along any fun tales from the park. Hope to see y'all there!</p>",
    reactions: [
      { user: 'Ranger Rick', content: '🤠' },
      { user: 'Hunter Cooper', content: '🤠' },
      { user: 'Misty Vale', content: '🤠' },
      { user: 'Hunter Cooper', content: '🍻' },
      { user: 'Hunter Cooper', content: '🍕' }
    ],
    comments: [
      {
        user: 'Sierra Peaks',
        body_html: "<p>I'm only coming if Rick promises to sing karaoke again.</p>",
        reactions: [
          { user: 'Ranger Rick', content: '😂' },
          { user: 'Autumn Hayes', content: '😂' },
          { user: 'Sage Woods', content: '😂' },
          { user: 'Sage Woods', content: '🎤' }
        ],
        replies: [
          {
            user: 'Ranger Rick',
            body_html: "<p>Hopefully I'll still have a voice after this one 😅</p>",
            reactions: [
              { user: 'Sierra Peaks', content: '😅' },
              { user: 'Autumn Hayes', content: '😅' }
            ]
          }
        ]
      },
      {
        user: 'Misty Vale',
        body_html: "<p>I'll be a little late, I have to pick up my daughter from soccer practice first.</p>",
        reactions: [{ user: 'Brooke Rivers', content: '❤️' }]
      }
    ]
  },
  staff_lounge_book_club: {
    author: 'Daisy Meadows',
    project: 'Staff Lounge',
    title: 'April Book Club Selection',
    description_html:
      "<p>Alright folks, it's that time again to pick our next adventure in pages! Here are the options we collected at last week's staff meeting.</p><p>What are we feeling for this month's book club selection?</p>",
    poll: {
      options: [
        {
          description: 'The Overstory',
          votes: ['Sage Woods', 'Misty Vale', 'Sunny Fields', 'Willow Carter', 'Ranger Rick']
        },
        {
          description: 'The Nature Fix',
          votes: ['Reed Marsh', 'Autumn Hayes']
        },
        {
          description: 'The Hidden Life of Trees',
          votes: []
        }
      ]
    }
  },
  staff_lounge_hiking_club: {
    author: 'Autumn Hayes',
    project: 'Staff Lounge',
    title: 'Hiking club this Saturday',
    description_html:
      "<p>Who's in for Hiking Club this Saturday? Weather is looking beautiful! Meet at the park at 8am?</p>",
    reactions: [
      { user: 'Sage Woods', content: '👍' },
      { user: 'Misty Vale', content: '👍' },
      { user: 'Sunny Fields', content: '👍' },
      { user: 'Hunter Cooper', content: '👍' }
    ],
    comments: [
      {
        user: 'Sage Woods',
        body_html: "<p>I'm in! Don't forget your sunscreen!</p>",
        reactions: [{ user: 'Misty Vale', content: '❤️' }]
      }
    ]
  },
  staff_lounge_overheard: {
    author: 'Reed Marsh',
    project: 'Staff Lounge',
    title: 'Overheard on the trail',
    description_html:
      '<p>I overheard a kid telling his friend on the trail today, "If we see a bear, we just have to run faster than the slowest hiker, right?" Made me chuckle.</p>',
    reactions: [
      { user: 'Sunny Fields', content: '😂' },
      { user: 'Misty Vale', content: '😂' },
      { user: 'Brooke Rivers', content: '😂' },
      { user: 'Ranger Rick', content: '😂' }
    ]
  },
  grant_opportunities: {
    author: 'Willow Carter',
    project: 'Grant Writing',
    title: 'Spring grant opportunities',
    description_html:
      '<p>As we head into the new season, a set of opportunities are on the horizon. Here\'s a quick rundown of grants that might be of interest to us:</p><ul><li><p><strong>National Conservation Grant</strong>: Supports efforts in preserving natural habitats. Deadline: April 15.</p></li><li><p><strong>Youth Engagement Fund</strong>: Aids in projects that engage young people with nature. Deadline: May 1.</p></li><li><p><strong>Historical Preservation Grant</strong>: For the restoration of historical landmarks within our parks. Deadline: April 30.</p></li><li><p><strong>Eco-Innovation Award</strong>: Offers funding for sustainable technology integration. Deadline: May 15.</p></li></ul><p>Please consider which of these grants align with your current projects and prepare to discuss potential applications in our next meeting. Message myself or Ranger Rick if you\'d like to discuss anything 1-on-1.</p><p>More info: <a class="prose-link" target="_blank" href="https://www.nps.gov/history/grants.htm"><span>https://www.nps.gov/history/grants.htm</span></a></p>',
    unfurled_link: 'https://www.nps.gov/history/grants.htm',
    reactions: [
      { user: 'Reed Marsh', content: '👍' },
      { user: 'Sunny Fields', content: '👍' },
      { user: 'Autumn Hayes', content: '👍' }
    ]
  },
  maintenance_request_1: {
    author: 'Misty Vale',
    project: 'Maintenance Requests',
    title: 'Campsite #4 water fountain',
    description_html:
      "<p>We've received reports of the water fountain at Campsite #4 malfunctioning—it's not dispensing water. I've flagged this as a priority for the maintenance team. Maintenance, please update once this has been addressed. Thanks!</p>",
    reactions: [{ user: 'Reed Marsh', content: '✅' }]
  },
  gear_talk_hiking_boots: {
    author: 'Hunter Cooper',
    project: 'Gear Talk',
    title: 'New hiking boots',
    description_html:
      '<p>Found a pair of these on sale this weekend, excited to take them on the trails soon! <a class="prose-link" target="_blank" href="https://www.backcountry.com/salomon-x-ultra-4-mid-gtx-hiking-shoe-mens"><span>https://www.backcountry.com/salomon-x-ultra-4-mid-gtx-hiking-shoe-mens</span></a></p>',
    unfurled_link: 'https://www.backcountry.com/salomon-x-ultra-4-mid-gtx-hiking-shoe-mens',
    reactions: [
      { user: 'Ranger Rick', content: '👀' },
      { user: 'Autumn Hayes', content: '😍' }
    ]
  },
  maintenance_request_2: {
    author: 'Reed Marsh',
    project: 'Maintenance Requests',
    title: 'Help needed: clearing the fallen tree on Oak Trail',
    description_html:
      "<p>I'm reaching out for assistance with the large oak that's come down on the Oak Trail. It's blocking a major path and we need to clear it before this weekend's influx of visitors. If anyone can spare some time tomorrow morning for the removal, it would greatly help expedite the process. We're coordinating efforts at 8 AM by the trailhead. Any help is appreciated to ensure visitor safety and trail accessibility. Thanks in advance!</p>"
  },
  thanks_reed: {
    author: 'Brooke Rivers',
    project: 'General',
    title: 'Reed Marsh: Wildflower Meadow signage repair',
    description_html:
      '<p>Reed Marsh deserves a big shout-out for the swift repair of the broken signage at Wildflower Meadow! His dedication ensured that visitors were quickly rerouted to avoid confusion and maintain the safety of our beautiful trails. Great job, Reed, for keeping Frontier Forest welcoming and accessible!</p>',
    reactions: [
      { user: 'Reed Marsh', content: '❤️' },
      { user: 'Ranger Rick', content: '👏' },
      { user: 'Autumn Hayes', content: '👏' },
      { user: 'Sage Woods', content: '👏' },
      { user: 'Willow Carter', content: '👏' }
    ],
    comments: [
      {
        user: 'Ranger Rick',
        body_html: '<p>Seconded! Great work, Reed.</p>',
        reactions: [{ user: 'Reed Marsh', content: '🙏' }]
      },
      {
        user: 'Sage Woods',
        body_html: '<p>Thanks for all you do, Reed!</p>'
      }
    ]
  },
  trail_report_2: {
    author: 'Ranger Rick',
    project: 'Trail Reports',
    title: 'Cliffside Trail inspection',
    description_html:
      "<p>Walked the Cliffside Trail for our routine inspection and noted some erosion near the midpoint lookout. The trail markers are still visible, but we should schedule maintenance to shore up the path.</p><p>Also, I spotted a pair of eagles nesting in the old pine by the east bend. Let's keep an eye on that area to minimize disturbances during their nesting period. 🦅</p>",
    reactions: [{ user: 'Reed Marsh', content: '👍' }]
  },
  maintenance_request_3: {
    author: 'Sierra Peaks',
    project: 'Maintenance Requests',
    title: 'Wildflower Meadow trailhead signage',
    description_html:
      "<p>A guest reported broken signage at the Wildflower Meadow trailhead. It appears to be weather-related damage. I'm heading out to assess the situation and will update on the repair timeline. If anyone has noticed other signs in the area that need attention, please let me know so we can address all issues in one go.</p>",
    reactions: [{ user: 'Reed Marsh', content: '🙏' }],
    comments: [
      {
        user: 'Reed Marsh',
        body_html: "<p>Thanks Misty, I'll join you as soon as I get to the park.</p>"
      }
    ]
  },
  gear_talk_camping_guide: {
    author: 'Reed Marsh',
    project: 'Gear Talk',
    title: 'Must-have gear items for first-time campers',
    description_html:
      '<p>I thought this guide was pretty good. <a class="prose-link" target="_blank" href="https://koa.com/blog/must-have-gear-items-for-first-time-campers/"><span>https://koa.com/blog/must-have-gear-items-for-first-time-campers/</span></a></p>',
    unfurled_link: 'https://koa.com/blog/must-have-gear-items-for-first-time-campers/',
    reactions: [{ user: 'Sage Woods', content: '👍' }],
    comments: [
      {
        user: 'Misty Vale',
        body_html:
          '<p>Thanks for sharing, Reed! I like this one too: <a class="prose-link" target="_blank" href="https://www.rei.com/learn/expert-advice/family-camping-checklist.html"><span>https://www.rei.com/learn/expert-advice/family-camping-checklist.html</span></a></p>'
      }
    ]
  },
  trail_report_1: {
    author: 'Ranger Rick',
    project: 'Trail Reports',
    title: 'Redwood Trail morning patrol',
    description_html:
      '<p>Just got back from the morning patrol on Redwood Trail. The recent rains have left some patches muddy, especially near the creek crossings. Hikers should be advised to wear appropriate footwear and expect slower paces. The overhead canopy offers some shelter, but sporadic drizzle is still coming through in places. No major obstructions or downed trees to report. Visibility is good, and the trail markers are all intact.</p>',
    reactions: [{ user: 'Reed Marsh', content: '👍' }]
  },
  maintenance_request_4: {
    author: 'Misty Vale',
    project: 'Maintenance Requests',
    title: 'Restocking First Aid Kits at Visitor Centers',
    description_html:
      "<p>I've noticed that several first aid kits at our visitor centers are running low on supplies. To ensure the safety of our staff and visitors, we need to restock them ASAP. Here's what's needed:</p><ul><li>Band-Aids of various sizes</li><li>Antiseptic wipes</li><li>Gauze pads</li><li>Medical tape</li><li>Disposable gloves</li></ul><p>If anyone has noticed other items that are missing, please add to this list. Thanks!</p>",
    reactions: [
      { user: 'Reed Marsh', content: '👍' },
      { user: 'Sunny Fields', content: '👍' },
      { user: 'Autumn Hayes', content: '👍' }
    ]
  },
  new_reservation_site_7: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 7, Redwood Grove',
    description_html:
      '<p>New reservation at site #7 for 2024-06-15.</p><ul><li>Site: #7</li><li>Campground: Redwood Grove</li><li>Party Size: 4</li><li>Arrival: 2024-06-15</li><li>Departure: 2024-06-18</li><li>Amount Paid: $120</li></ul>'
  },
  new_reservation_site_12: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 12, Maple Valley',
    description_html:
      '<p>New reservation at site #12 for 2024-07-01.</p><ul><li>Site: #12</li><li>Campground: Maple Valley</li><li>Party Size: 2</li><li>Arrival: 2024-07-01</li><li>Departure: 2024-07-05</li><li>Amount Paid: $160</li></ul>',
    comments: [
      {
        oauth_provider: 'zapier',
        body_html: '<p>This reservation was canceled. $160 refund issued.</p>',
        reactions: [{ user: 'Ranger Rick', content: '👍' }]
      }
    ]
  },
  new_reservation_site_3: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 3, Pine Ridge',
    description_html:
      '<p>New reservation at site #3 for 2024-07-10.</p><ul><li>Site: #3</li><li>Campground: Pine Ridge</li><li>Party Size: 6</li><li>Arrival: 2024-07-10</li><li>Departure: 2024-07-14</li><li>Amount Paid: $200</li></ul>'
  },
  new_reservation_site_9: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 9, Lakeside Retreat',
    description_html:
      '<p>New reservation at site #9 for 2024-08-05.</p><ul><li>Site: #9</li><li>Campground: Lakeside Retreat</li><li>Party Size: 3</li><li>Arrival: 2024-08-05</li><li>Departure: 2024-08-08</li><li>Amount Paid: $135</li></ul>'
  },
  new_reservation_site_15: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 15, Oak Haven',
    description_html:
      '<p>New reservation at site #15 for 2024-08-20.</p><ul><li>Site: #15</li><li>Campground: Oak Haven</li><li>Party Size: 5</li><li>Arrival: 2024-08-20</li><li>Departure: 2024-08-25</li><li>Amount Paid: $250</li></ul>'
  },
  new_reservation_site_1: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 1, Redwood Grove',
    description_html:
      '<p>New reservation at site #1 for 2024-09-01.</p><ul><li>Site: #1</li><li>Campground: Redwood Grove</li><li>Party Size: 2</li><li>Arrival: 2024-09-01</li><li>Departure: 2024-09-03</li><li>Amount Paid: $80</li></ul>',
    comments: [
      {
        oauth_provider: 'zapier',
        body_html: '<p>This reservation was canceled. $80 refund issued.</p>'
      }
    ]
  },
  new_reservation_site_6: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 6, Maple Valley',
    description_html:
      '<p>New reservation at site #6 for 2024-09-15.</p><ul><li>Site: #6</li><li>Campground: Maple Valley</li><li>Party Size: 4</li><li>Arrival: 2024-09-15</li><li>Departure: 2024-09-18</li><li>Amount Paid: $120</li></ul>'
  },
  new_reservation_site_11: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 11, Pine Ridge',
    description_html:
      '<p>New reservation at site #11 for 2024-10-05.</p><ul><li>Site: #11</li><li>Campground: Pine Ridge</li><li>Party Size: 3</li><li>Arrival: 2024-10-05</li><li>Departure: 2024-10-08</li><li>Amount Paid: $120</li></ul>'
  },
  new_reservation_site_4: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 4, Lakeside Retreat',
    description_html:
      '<p>New reservation at site #4 for 2024-10-20.</p><ul><li>Site: #4</li><li>Campground: Lakeside Retreat</li><li>Party Size: 2</li><li>Arrival: 2024-10-20</li><li>Departure: 2024-10-22</li><li>Amount Paid: $90</li></ul>'
  },
  new_reservation_site_8: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 8, Oak Haven',
    description_html:
      '<p>New reservation at site #8 for 2024-11-01.</p><ul><li>Site: #8</li><li>Campground: Oak Haven</li><li>Party Size: 6</li><li>Arrival: 2024-11-01</li><li>Departure: 2024-11-05</li><li>Amount Paid: $200</li></ul>'
  },
  new_reservation_site_2: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 2, Redwood Grove',
    description_html:
      '<p>New reservation at site #2 for 2024-11-15.</p><ul><li>Site: #2</li><li>Campground: Redwood Grove</li><li>Party Size: 4</li><li>Arrival: 2024-11-15</li><li>Departure: 2024-11-18</li><li>Amount Paid: $120</li></ul>'
  },
  new_reservation_site_14: {
    oauth_provider: 'zapier',
    project: 'Reservations',
    title: 'New Reservation: Site 14, Maple Valley',
    description_html:
      '<p>New reservation at site #14 for 2024-12-01.</p><ul><li>Site: #14</li><li>Campground: Maple Valley</li><li>Party Size: 2</li><li>Arrival: 2024-12-01</li><li>Departure: 2024-12-03</li><li>Amount Paid: $80</li></ul>'
  }
} satisfies Record<string, Post>

const threads = [
  {
    owner: 'Ranger Rick',
    members: ['Brooke Rivers'],
    favorites: ['Ranger Rick'],
    messages: [
      {
        user: 'Ranger Rick',
        content: '<p>Hey Brooke, could you help me review the latest trail map?</p>'
      },
      {
        user: 'Brooke Rivers',
        content: "<p>Sure thing! I'll take a look and get back to you by the end of the day.</p>",
        reactions: [{ user: 'Ranger Rick', content: '👍' }]
      }
    ]
  },
  {
    title: 'Red Alert',
    owner: 'Ranger Rick',
    favorites: ['Ranger Rick', 'Reed Marsh'],
    image_path: 'o/dev-seed-files/thread-icon-red-alert.png',
    members: Object.keys(assignableUsers).filter((k) => k !== 'Ranger Rick') as UserKey[],
    messages: [
      {
        user: 'Ranger Rick',
        content:
          '<p>Hey team, just got a report of a downed tree blocking the western trail. We need to clear it ASAP.</p>'
      },
      {
        user: 'Cliff Rockwell',
        content: "<p>I'll grab the chainsaw and head out there. Should we reroute hikers in the meantime?</p>"
      },
      {
        user: 'Autumn Hayes',
        content:
          "<p>Good idea, Cliff. I'll update the trail status on the website and put up some signs at the trailhead.</p>"
      },
      {
        user: 'Brooke Rivers',
        content: '<p>I can assist Cliff with the tree removal. Should I bring anything?</p>'
      },
      {
        user: 'Ranger Rick',
        content: '<p>Some cones to mark off the area would be great.</p>',
        reactions: [{ user: 'Brooke Rivers', content: '👍' }]
      },
      {
        user: 'Reed Marsh',
        content: "<p>I'm near the western trail now, I'll hang around in case any hikers come by.</p>",
        reactions: [{ user: 'Ranger Rick', content: '🙏' }]
      },
      {
        user: 'Autumn Hayes',
        content: '<p>Thanks, Reed!</p>'
      },
      {
        user: 'Cliff Rockwell',
        content: "<p>On my way now. Rick, can you coordinate with the visitor's center to inform incoming guests?</p>"
      },
      {
        user: 'Ranger Rick',
        content: '👍🫡'
      },
      {
        user: 'Reed Marsh',
        content: '<p>Met some hikers, they were understanding about the detour. Safety first!</p>',
        reactions: [{ user: 'Cliff Rockwell', content: '❤️' }]
      },
      {
        user: 'Ranger Rick',
        content: '<p>Great teamwork, everyone. Keep me updated on the progress.</p>',
        reactions: [
          { user: 'Cliff Rockwell', content: '❤️' },
          { user: 'Autumn Hayes', content: '❤️' },
          { user: 'Brooke Rivers', content: '👍' }
        ]
      }
    ]
  },
  {
    title: 'Weather Report',
    owner: 'Ranger Rick',
    members: ['Brooke Rivers', 'Cliff Rockwell', 'Sierra Peaks', 'Reed Marsh'],
    messages: [
      {
        oauth_provider: 'zapier',
        content:
          '<p>🌩️ <strong>Weather Alert:</strong> Potential thunderstorm detected. 30% chance of occurrence within the next 12 hours.</p>'
      },
      {
        oauth_provider: 'zapier',
        content:
          '<p>⚠️ <strong>Update:</strong> Thunderstorm probability increased to 60%. Potential for heavy rainfall and strong winds within the next 6 hours.</p>'
      },
      {
        user: 'Cliff Rockwell',
        content:
          '<p>cc <span class="mention" data-type="mention" data-id="rsov90kley56" data-label="Ranger Rick" data-username="ranger_rick">@Ranger Rick</span></p>',
        reactions: [{ user: 'Ranger Rick', content: '👀' }]
      },
      {
        oauth_provider: 'zapier',
        content:
          '<p>🌪️ <strong>Alert:</strong> Severe thunderstorm warning issued. 80% chance of heavy rainfall, strong winds, and lightning within the next 2 hours.</p>'
      },
      {
        oauth_provider: 'zapier',
        content:
          '<p>⛈️ <strong>Update:</strong> Thunderstorm now in progress. Heavy rainfall and frequent lightning reported.</p>'
      },
      {
        oauth_provider: 'zapier',
        content:
          '<p>🌤️ <strong>Alert:</strong> Thunderstorm warning lifted. Conditions expected to improve over the next hour.</p>'
      },
      {
        user: 'Ranger Rick',
        content:
          '<p>Looks like we\'re in the clear. <span class="mention" data-type="mention" data-id="t8w9inw4hxoe" data-label="Reed Marsh" data-username="reed_marsh">@Reed Marsh</span> can you check the trails for any damage?</p>',
        reactions: [{ user: 'Reed Marsh', content: '🫡' }]
      }
    ]
  }
] satisfies Thread[]

const notes = [
  {
    title: '2024 Park Plan',
    description_html: getFile('./html/note-2024-park-plan.html'),
    public_visibility: false,
    project: 'General',
    project_permission: 'view',
    member: 'Ranger Rick',
    description_schema_version: 4
  }
] satisfies Note[]

const calls = [
  {
    generated_title: 'Park Ranger Rick',
    peers: ['Ranger Rick', 'Daisy Meadows', 'Reed Marsh', 'Cliff Rockwell'],
    recordings: [
      {
        file_path: 'o/dev-seed-files/park-rec.mp4',
        transcription_vtt: getFile('./vtt/call-parks-n-rec.vtt'),
        size: 65335581,
        duration: 233012 / 1000,
        max_width: 1920,
        max_height: 1080,
        summary_sections: [
          {
            section: 'summary',
            response:
              '<p>The team met with park rangers to discuss park safety issues. Ranger Rick highlighted recent security challenges and resource limitations. Daisy Meadows committed to securing funds for improved safety measures.</p>'
          },
          {
            section: 'agenda',
            response: `<p><strong>Meeting with Park Rangers</strong></p><ul><li><p>Daisy emphasized the importance of meeting with park rangers.</p></li><li><p>Cliff introduced Reed as the head of outdoor security.</p></li><li><p>Daisy expressed a desire to improve park safety.</p></li></ul><p><strong>Park Safety Concerns</strong></p><ul><li><p>Daisy and Ranger Rick discussed the need for better park safety measures.</p></li><li><p>Ranger Rick highlighted issues like lack of safety lights due to budget cuts.</p></li><li><p>Daisy committed to securing funds for better protection.</p></li></ul><p><strong>Tour of the Park</strong></p><ul><li><p>Ranger Rick led a tour, pointing out key areas and issues.</p></li><li><p>The team observed the park's condition and discussed safety challenges.</p></li><li><p>Reed and Daisy noted specific problem areas during the tour.</p></li></ul><p><strong>Equipment and Resources</strong></p><ul><li><p>Ranger Rick mentioned the loss and damage of park carts.</p></li><li><p>The team discussed the impact of limited resources on park safety.</p></li><li><p>Daisy and Cliff acknowledged the need for better equipment.</p></li></ul>`
          },
          {
            section: 'next_steps',
            response: `<ul><li><p><span class=\"mention\" data-type=\"mention\" data-id=\"t98ps3s7v4bm\" data-label=\"Daisy Meadows\" data-username=\"daisy_meadows\">@Daisy Meadows</span> will secure funding to enhance park safety.</p></li><li><p><span class=\"mention\" data-type=\"mention\" data-id=\"rsov90kley56\" data-label=\"Ranger Rick\" data-username=\"ranger_rick\">@Ranger Rick</span> will show the team the current problems and safety issues in the park.</p></li><li><p><span class=\"mention\" data-type=\"mention\" data-id=\"t98ps3s7v4bm\" data-label=\"Daisy Meadows\" data-username=\"daisy_meadows\">@Daisy Meadows</span> will coordinate with <span class=\"mention\" data-type=\"mention\" data-id=\"t8w9inw4hxoe\" data-label=\"Reed Marsh\" data-username=\"reed_marsh\">@Reed Marsh</span> to improve park security measures.</p></li><li><p><span class=\"mention\" data-type=\"mention\" data-id=\"h6dz7oobwajp\" data-label=\"Cliff Rockwell\" data-username=\"cliff_rockwell\">@Cliff Rockwell</span> will run alongside the cart during the park tour.</p></li><li><p><span class=\"mention\" data-type=\"mention\" data-id=\"rsov90kley56\" data-label=\"Ranger Rick\" data-username=\"ranger_rick\">@Ranger Rick</span> will provide a detailed tour of the park's problem areas.</p></li></ul>`
          }
        ]
      }
    ]
  }
] satisfies Call[]

Object.values(posts).forEach((post) => {
  // warn if any poll options are longer than 32 characters
  if ('poll' in post) {
    post.poll.options.forEach((option) => {
      if (option.description.length > 32) {
        console.warn(`Poll option "${option.description}" must be 32 characters or fewer.`)
      }
    })
  }

  // warn if any comments that are longer than 3 characters don't have HTML
  if ('comments' in post) {
    post.comments.forEach((comment) => {
      if (comment.body_html.length > 3 && !comment.body_html.includes('<')) {
        console.warn(`Comment "${comment.body_html}" is missing HTML tags.`)
      }

      if ('replies' in comment && comment.replies) {
        comment.replies.forEach((reply) => {
          if (reply.body_html.length > 3 && !reply.body_html.includes('<')) {
            console.warn(`Reply "${reply.body_html}" is missing HTML tags.`)
          }
        })
      }
    })
  }
})

// fold users' and projects' names into their respective objects
const usersArray = Object.entries(users).map(([name, data]) => ({ name, ...data }))
const projectsArray = Object.entries(projects).map(([name, data]) => ({ name, ...data }))
const postsAray = Object.values(posts)

const path = '../../api/lib/demo_orgs/data'

writeFileSync(path + '/users.json', JSON.stringify(usersArray))
writeFileSync(path + '/projects.json', JSON.stringify(projectsArray))
writeFileSync(path + '/posts.json', JSON.stringify(postsAray))
writeFileSync(path + '/threads.json', JSON.stringify(threads))
writeFileSync(path + '/notes.json', JSON.stringify(notes))
writeFileSync(path + '/calls.json', JSON.stringify(calls))
