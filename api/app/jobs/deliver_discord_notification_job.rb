# frozen_string_literal: true

class DeliverDiscordNotificationJob < BaseJob
  sidekiq_options queue: "default", retry: 3

  def perform(id)
    notification = Notification.find(id)
    return unless notification.organization_membership

    membership = notification.organization_membership
    return unless membership.discord_user_id.present?

    organization = membership.organization
    integration = organization.discord_integration
    return unless integration

    # Build Discord message embed
    embed = build_discord_embed(notification)

    # Find the appropriate Discord channel
    channel_id = find_discord_channel(notification, organization)
    return unless channel_id

    # Send notification to Discord
    send_discord_message(integration.token, channel_id, embed, membership.discord_user_id)
  end

  private

  def build_discord_embed(notification)
    {
      embeds: [{
        title: notification_title(notification),
        description: notification_description(notification),
        url: notification_url(notification),
        color: notification_color(notification),
        timestamp: notification.created_at.iso8601,
        author: {
          name: notification.actor&.display_name || "Campsite",
          icon_url: notification.actor&.avatar_url
        },
        fields: build_embed_fields(notification)
      }]
    }
  end

  def notification_title(notification)
    case notification.reason
    when "mention"
      "You were mentioned"
    when "comment"
      "New comment on your post"
    when "reaction"
      "New reaction to your post"
    when "follow_up"
      "Follow-up reminder"
    else
      "New notification"
    end
  end

  def notification_description(notification)
    target = notification.target
    
    case target
    when Post
      target.title || "Untitled post"
    when Comment
      target.body_text&.truncate(200) || "Comment"
    when Message
      target.content&.truncate(200) || "Message"
    else
      "You have a new notification in Campsite"
    end
  end

  def notification_url(notification)
    # Build the Campsite URL for the notification
    base_url = Rails.env.production? ? "https://app.campsite.com" : "http://app.campsite.test:3000"
    
    target = notification.target
    case target
    when Post
      "#{base_url}/#{notification.organization.slug}/posts/#{target.public_id}"
    when Comment
      post = target.subject
      "#{base_url}/#{notification.organization.slug}/posts/#{post.public_id}#comment-#{target.public_id}"
    else
      "#{base_url}/#{notification.organization.slug}/notifications"
    end
  end

  def notification_color(notification)
    # Discord embed colors (in decimal)
    case notification.reason
    when "mention"
      0x3B82F6 # Blue
    when "comment"
      0x10B981 # Green
    when "reaction"
      0xF59E0B # Yellow
    when "follow_up"
      0xEF4444 # Red
    else
      0x6B7280 # Gray
    end
  end

  def build_embed_fields(notification)
    fields = []
    
    if notification.target.is_a?(Post) && notification.target.project
      fields << {
        name: "Project",
        value: notification.target.project.name,
        inline: true
      }
    end

    if notification.actor
      fields << {
        name: "From",
        value: notification.actor.display_name,
        inline: true
      }
    end

    fields
  end

  def find_discord_channel(notification, organization)
    # Try to find a project-specific channel first
    if notification.target.respond_to?(:project) && notification.target.project
      project = notification.target.project
      return project.discord_channel_id if project.discord_channel_id.present?
    end

    # Fall back to organization's default Discord channel
    # You might want to add a default notification channel setting
    organization.discord_notification_channel_id
  end

  def send_discord_message(token, channel_id, embed, user_id_to_mention = nil)
    message_data = embed.dup

    # Add mention if we have a Discord user ID
    if user_id_to_mention
      message_data[:content] = "<@#{user_id_to_mention}>"
    end

    response = HTTP.auth("Bot #{token}")
                  .post("https://discord.com/api/channels/#{channel_id}/messages", json: message_data)

    unless response.status.success?
      Rails.logger.error("Failed to send Discord notification: #{response.body}")
    end

    response.status.success?
  end
end