# frozen_string_literal: true

class Post
  class CreateDefaultPosts
    def self.onboard(member:, project:)
      description_html = <<~HTML.squish
        <p>Campsite is the new standard for thoughtful team communication — we replace your noisy chats with transparent, focused, and organized posts.</p>

        <p>Here are some quick tips to help you get started:</p>

        <ul class="task-list" data-type="taskList">
        #{task_item("Invite a team member to your workspace.")}
          #{task_item("<a href=\"https://www.campsite.com/blog/posts-are-the-sweet-spot-between-chat-and-docs\" target=\"_blank\">Read more</a> about why post-first communication is better for teams.")}
          #{task_item("Create a post to share what you're working on.")}
          #{task_item("Resolve a post — we’ll automatically summarize the post + comments.")}
          #{task_item("Type <kbd>Mod</kbd> <kbd>K</kbd> to open the command menu and quickly navigate anywhere.")}
          #{task_item("If you use Linear, add the integration to create and link Linear issues from posts. <a class=\"prose-link\" target=\"_blank\" href=\"https://www.campsite.com/changelog/2024-07-09-create-linear-issues\">Learn more</a>")}
        </ul>

        <p>You can request a feature or report a bug by clicking the <kbd>?</kbd> in the sidebar or by emailing us at <a class="prose-link" target="_blank" href="mailto:support@campsite.com">support@campsite.com</a>. If you’d like help onboarding your team, <a class="prose-link" target="_blank" href="https://cal.com/brianlovin/campsite-demo">book 30 minutes with Brian</a>, one of Campsite’s co-founders.</p>
      HTML

      CreatePost.new(
        params: {
          title: "Welcome to Campsite!",
          description_html: description_html,
        },
        organization: member.organization,
        integration: member.organization.campsite_integration,
        project: project,
        skip_notifications: true,
      ).run
    end

    def self.inline_link_unfurl(note)
      <<~HTML.squish
        <link-unfurl href="#{note.url}"></link-unfurl>
      HTML
    end

    def self.task_item(task)
      <<~HTML.squish
        <li class="task-item" data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>#{task}</p></div></li>
      HTML
    end
  end
end
