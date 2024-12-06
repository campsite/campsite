# frozen_string_literal: true

module Mentionable
  extend ActiveSupport::Concern

  MENTION_REGEX = /@[\w\\]+/

  def replace_mentions_with_html_links(content, viewer_can_edit = false)
    parsed = Nokogiri::HTML.fragment(content)

    mentions = parsed.css("organization-membership-mention")
    mentioned_ids = mentions.map { |m| m.attr("data-id") }
    mentioned_members = OrganizationMembership.kept.where(public_id: mentioned_ids).eager_load(:user).group_by(&:public_id)

    mentions.each do |node|
      if (member = mentioned_members[node.attr("data-id")]&.first)
        node.replace(
          # Mentions must be wrapped in a <span data-type="mention"> tag for the TipTap editor to recognize them on edit.
          # https://github.com/ueberdosis/tiptap/blob/2a86ac077473f1d84c2845568d7a55b943370863/packages/extension-mention/src/mention.ts#L104-L110
          content_tag(
            :span,
            link_to("@#{member.username}", member.url, class: "mention"),
            data: {
              type: "mention",
              id: member.public_id,
              label: member.username,
            },
          ),
        )
      else
        node.replace(node.children)
      end
    end

    task_lists = parsed.css('ul:has(input[type="checkbox"])')
    task_lists.each do |node|
      classes = node.get_attribute("class").to_s.split(" ")
      # must match class configured for TaskList in MarkdownEditor/index.tsx
      classes << "task-list"
      node.set_attribute("class", classes.join(" "))

      # https://tiptap.dev/api/nodes/task-list
      node.set_attribute("data-type", "taskList")
    end

    task_items = parsed.css('li:has(input[type="checkbox"])')
    task_items.each do |node|
      classes = node.get_attribute("class").to_s.split(" ")
      # must match class configured for TaskItem in MarkdownEditor/index.tsx
      classes << "task-item"
      node.set_attribute("class", classes.join(" "))

      # https://tiptap.dev/api/nodes/task-item
      node.set_attribute("data-type", "taskItem")
      if node.at_css('input[type="checkbox"][checked="checked"]')
        node.set_attribute("data-checked", "checked")
      end
    end

    if viewer_can_edit
      parsed.css('input[type="checkbox"]').remove_attribute("disabled")
    end

    parsed.to_s
  end

  def render_html(string)
    CommonMarker.render_html(
      string,
      [:LIBERAL_HTML_TAG, :STRIKETHROUGH_DOUBLE_TILDE, :FULL_INFO_STRING, :UNSAFE],
      [:table, :tasklist, :strikethrough, :autolink, :tagfilter],
    ).strip
  end

  def new_user_mentions(previous_text: send("#{mentionable_attribute}_previously_was") || "")
    previous_doc = Nokogiri::HTML.fragment(previous_text)

    current_mention_member_ids = member_mention_ids
    previous_mention_member_ids = member_mention_ids(previous_doc)
    mention_member_ids = current_mention_member_ids - previous_mention_member_ids
    mention_member_ids -= [member&.username]

    organization.members.joins(:organization_memberships).where(organization_memberships: { public_id: mention_member_ids })
  end

  def new_app_mentions(previous_text: send("#{mentionable_attribute}_previously_was") || "")
    previous_doc = Nokogiri::HTML.fragment(previous_text)

    current_app_mention_member_ids = app_mention_ids
    previous_app_mention_member_ids = app_mention_ids(previous_doc)
    app_mention_member_ids = current_app_mention_member_ids - previous_app_mention_member_ids

    organization.kept_oauth_applications.where(public_id: app_mention_member_ids)
  end

  def member_mention_ids(doc = Nokogiri::HTML.fragment(self[mentionable_attribute] || ""))
    # data-role is a newer attribute, so we should assume any mention without it is a member mention.
    # newer mentions may or may not have data-role="app" or data-role="member".
    mentions = doc.css("span[data-type=mention]").select { |m| m.attr("data-role") != "app" }
    mentions.map { |m| m.attr("data-id") }
  end

  def app_mention_ids(doc = Nokogiri::HTML.fragment(self[mentionable_attribute] || ""))
    mentions = doc.css("span[data-type=mention][data-role=app]")
    mentions.map { |m| m.attr("data-id") }
  end
end
