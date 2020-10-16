# Topics, Subscriptions, and Publications

Campsite is fundamentally a message broker, sending messages ("publications") from one consumer to another.

Conceptually:

 - A **publication** is a message that can be sent. A publication is always associated with an underlying **post** – the concept of post can be largely ignored here as posts do not affect delivery.

 - A **topic** is a destination for publications to be sent to. Each user has a public topic with the same ID as their user ID, and a private topic.

 - A **subscription** binds a user to a topic: a user being subscribed to a topic indicates that it is interested in all publications that are sent to it. Users are implicitly subscribed to their own public and private topics.

All publications in Campsite can be globally ordered based on their publishing timestamps and ID. This simplifies many things, e.g. users can paginate across all of their subscriptions with a simple timestamp-ID cursor. The downside is that because all publications are serialized across an entire Campsite instance, there is a single contention point on ordering. However, Campsite can still provide "good enough" semantics: events happening at the exact same timestamp may be lost, but can be recovered on a fresh fetching of data from the database.

When fetching from the database, Campsite uses fan-in on read, rather than fan-out on write, to find the relevant publications across all subscriptions.

When updating interested parties on changes, Campsite uses fan-out on write to notify: this is so subscribers can subscribe to a single channel in the backing message queue without having to maintain dynamic membership.
