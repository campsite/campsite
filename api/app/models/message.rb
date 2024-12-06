# frozen_string_literal: true

class Message < ApplicationRecord
  include Discard::Model
  include Mentionable
  include PublicIdGenerator
  include Reactable
  include ActionView::Helpers::SanitizeHelper

  FILE_LIMIT = 10

  DELETED_CONTENT = "<p><em>This message has been deleted.</em></p>"
  PUBLIC_API_ALLOWED_ORDER_FIELDS = [:created_at]

  belongs_to :sender, class_name: "OrganizationMembership", optional: true
  belongs_to :integration, optional: true
  belongs_to :oauth_application, optional: true
  belongs_to :message_thread

  belongs_to :reply_to, class_name: "Message", optional: true
  has_one :child, class_name: "Message", foreign_key: :reply_to_id

  has_many :shared_posts, class_name: "Post", foreign_key: :from_message_id
  belongs_to :system_shared_post, class_name: "Post", optional: true

  has_many :attachments, as: :subject, dependent: :destroy
  belongs_to :call, optional: true

  has_many :message_notifications, dependent: :destroy_async

  delegate :organization, to: :message_thread
  delegate :members_base_url, to: :organization
  delegate :update_latest_message!, to: :message_thread, prefix: true

  encrypts :content, deterministic: true

  validates :call_id, uniqueness: { scope: :message_thread_id }, allow_nil: true
  validates :content, presence: true, unless: -> { attachments.any? || call }

  accepts_nested_attributes_for :attachments

  after_discard :message_thread_update_latest_message!, if: -> { !system? && message_thread&.latest_message_id == id }

  scope :public_api_includes, -> {
    eager_load(:sender, :integration, :oauth_application, :reply_to)
  }

  def self.discard_all_by_actor(actor)
    # preload thread for message_thread_update_latest_message callback
    eager_load(:message_thread).find_each do |message|
      message.discard
      InvalidateMessageJob.perform_async(actor.id, message.id, "discard-message")
    end
  end

  def api_type_name
    "Message"
  end

  def has_content?
    return false if call

    content.present? && content != "<p></p>"
  end

  def first_attachment
    attachments.first
  end

  def last_attachment
    attachments.last unless discarded?
  end

  def author
    sender || integration || oauth_application
  end

  def system?
    author.nil?
  end

  def preview_truncated(thread: nil, viewer: nil)
    thread ||= message_thread
    sender_name = viewer == sender ? "You" : sender&.display_name

    if has_content?
      content = (discarded? ? Message::DELETED_CONTENT : self.content).dup
      content = HtmlTransform.new(content).plain_text&.truncate(140, separator: /\s/)
      return content if !thread.group? || !sender

      "#{sender_name}: #{content}"
    elsif attachments&.any?
      return "Sent an attachment" unless sender

      "#{sender_name} sent an attachment"
    elsif call
      return "Started a call" unless sender

      "#{sender_name} started a call"
    end
  end

  def mentions?(organization_membership)
    return false unless has_content?

    parsed = Nokogiri::HTML.fragment(content)

    member_mention_ids(parsed).include?(organization_membership.public_id)
  end

  def mentioned_apps
    return [] unless has_content?

    parsed = Nokogiri::HTML.fragment(content)

    organization.kept_oauth_applications.where(public_id: app_mention_ids(parsed))
  end

  def reply?(organization_membership)
    return false unless reply_to

    reply_to.sender == organization_membership
  end

  def self.latest_shared_post_async(ids:, user:)
    subquery = Post
      .kept
      .select("max(posts.id)")
      .where(from_message_id: ids)
      .viewable_by(user)
      .group(:from_message_id)

    scope = Post.where(id: subquery).load_async

    AsyncPreloader.new(scope) do |scope|
      scope.index_by(&:from_message_id)
    end
  end

  def links_in_content
    return [] unless has_content?

    parsed = Nokogiri::HTML.fragment(content)

    links = parsed.css("a").map do |a|
      next unless (href = a.attr("href"))

      begin
        uri = URI.parse(href)
      rescue URI::InvalidURIError, URI::InvalidComponentError
        uri = nil
      end

      next unless uri
      next unless uri.absolute? && uri.scheme == "https"

      uri.to_s
    end
    links.compact
  end

  def skip_push?(to_member:, ignore_pause: false)
    return true if system? || to_member == sender
    return true if !message_thread.group? && call
    return true if to_member.user.notifications_paused? && !ignore_pause

    thread_membership = message_thread.memberships.find_by(organization_membership: to_member)
    return true if thread_membership.last_read_at && thread_membership.last_read_at > created_at
    return true if thread_membership.notification_level_none?
    return true if thread_membership.notification_level_mentions? && !mentions?(to_member) && !reply?(to_member)

    false
  end

  def mailer_content
    @mailer_content ||= RichText.new(content)
      .replace_mentions_with_links(members_base_url: members_base_url)
      .replace_resource_mentions_with_links(organization)
      .replace_link_unfurls_with_links
      .to_s
  end
end
