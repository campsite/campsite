# frozen_string_literal: true

class ProcessDiscordMessageJob < BaseJob
  queue_as :default

  def perform(discord_event)
    payload = discord_event.payload
    
    # Find the organization by Discord guild ID
    organization = Organization.find_by(discord_guild_id: payload["guild_id"])
    return unless organization

    # Find or create the user based on Discord user info
    discord_user = payload["author"]
    return if discord_user["bot"] # Ignore bot messages

    user = find_or_create_discord_user(discord_user, organization)
    return unless user

    # Find the project associated with this Discord channel
    project = organization.projects.find_by(discord_channel_id: payload["channel_id"])
    return unless project

    # Create a post in Campsite from the Discord message
    member = organization.memberships.find_by(user: user)
    return unless member

    post = Post.create!(
      organization_membership: member,
      project: project,
      title: truncate_for_title(payload["content"]),
      description_html: format_discord_message(payload["content"]),
      visibility: "default",
      workflow_state: "published",
      published_at: Time.current
    )

    # Handle attachments
    payload["attachments"]&.each do |attachment|
      create_attachment_from_discord(post, attachment)
    end

    # Handle mentions
    handle_discord_mentions(post, payload["mentions"])
  end

  private

  def find_or_create_discord_user(discord_user, organization)
    # Try to find by Discord username first
    user = User.find_by(discord_username: discord_user["username"])
    return user if user

    # Try to find by email if we have it
    # In a real implementation, you'd need to fetch this from Discord API
    # with proper OAuth scopes
    nil
  end

  def truncate_for_title(content)
    return "Discord Message" if content.blank?
    content.truncate(100)
  end

  def format_discord_message(content)
    # Escape HTML entities first to prevent XSS
    escaped = CGI.escapeHTML(content)

    # Convert Discord markdown to HTML
    # This is a simplified version - you'd want more sophisticated parsing
    html = escaped.gsub(/\*\*(.*?)\*\*/, '<strong>\1</strong>')
                  .gsub(/\*(.*?)\*/, '<em>\1</em>')
                  .gsub(/```(.*?)```/m, '<pre><code>\1</code></pre>')
                  .gsub(/`(.*?)`/, '<code>\1</code>')
                  .gsub(/\n/, '<br>')

    "<p>#{html}</p>"
  end

  def create_attachment_from_discord(post, discord_attachment)
    # Download and attach the file from Discord
    response = HTTP.get(discord_attachment["url"])
    return unless response.status.success?

    tempfile = Tempfile.new([discord_attachment["filename"], File.extname(discord_attachment["filename"])])
    tempfile.binmode
    tempfile.write(response.body.to_s)
    tempfile.rewind

    post.attachments.create!(
      file_path: discord_attachment["url"],
      file_type: discord_attachment["content_type"],
      name: discord_attachment["filename"],
      size: discord_attachment["size"],
      width: discord_attachment["width"],
      height: discord_attachment["height"]
    )
  ensure
    tempfile&.close
    tempfile&.unlink
  end

  def handle_discord_mentions(post, mentions)
    return unless mentions.present?

    mentions.each do |mention|
      mentioned_user = User.find_by(discord_username: mention["username"])
      next unless mentioned_user

      # Create mention/notification in Campsite
      # Implementation depends on your mention system
    end
  end
end