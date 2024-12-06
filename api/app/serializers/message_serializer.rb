# frozen_string_literal: true

class MessageSerializer < ApiSerializer
  api_field :public_id, name: :id

  api_field :content, default: "" do |message|
    next if message.call
    next Message::DELETED_CONTENT if message.discarded?

    message.content
  end

  api_field :unfurled_link, nullable: true do |message|
    next nil if message.discarded?
    next nil unless message.content
    next nil if message.integration
    next nil if message.oauth_application

    message.links_in_content.first
  end

  api_field :created_at
  api_field :updated_at
  api_field :discarded_at, nullable: true
  api_field :has_content?, name: :has_content, type: :boolean

  api_association :sender, blueprint: OrganizationMemberSerializer do |message|
    message.integration ||
      message.oauth_application ||
      message.sender ||
      OrganizationMembership::NullOrganizationMembership.new(system: true)
  end

  api_association :reply_to, name: :reply, blueprint: MessageReplySerializer, nullable: true

  api_association :attachments, blueprint: AttachmentSerializer, is_array: true do |message|
    next [] if message.discarded?

    message.attachments
  end

  api_association :call, blueprint: MessageCallSerializer, nullable: true

  api_field :viewer_is_sender, type: :boolean do |message, opts|
    next false unless message.sender_id

    message.sender_id == opts[:member]&.id
  end

  api_field :viewer_can_delete, type: :boolean do |message, opts|
    next false unless opts[:member]

    viewer_is_sender = message.sender_id && message.sender_id == opts[:member].id

    viewer_is_sender || opts[:member].role_has_permission?(resource: Role::MESSAGE_RESOURCE, permission: Role::DESTROY_ANY_ACTION)
  end

  api_association :grouped_reactions, is_array: true, blueprint: GroupedReactionSerializer do |message, options|
    next [] if message.discarded?

    preloads(options, :grouped_reactions, message.id) || []
  end

  api_field :shared_post_url, nullable: true do |message, opts|
    preloads(opts, :latest_shared_posts, message.id)&.url
  end

  # client-only fields

  api_field :optimistic_id, type: :string, nullable: true do
    nil
  end

  def self.preload(records, options)
    member = options[:member]
    user = options[:user]
    ids = records.map(&:id)
    {
      grouped_reactions: Message.grouped_reactions_async(ids, member),
      latest_shared_posts: Message.latest_shared_post_async(ids: ids, user: user),
    }
  end
end
