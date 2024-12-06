# frozen_string_literal: true

class PostShare
  include ActiveModel::Model

  attr_accessor :post, :member_ids, :slack_channel_id, :user

  validate :member_ids_must_be_valid
  validate :slack_channel_id_must_belong_to_organization
  validate :target_must_be_present

  delegate :organization, to: :post
  delegate :mrkdwn_section_block, to: SlackBlockKit

  def save
    return false unless valid?

    SharePostToSlackJob.perform_async(post.id, user.id, slack_channel_id) if slack_channel_id
    self
  end

  def create_slack_message!
    subject_text = post.poll ? "poll" : "post"

    message = {
      text: share_by_author? ? "#{user.display_name} shared a #{subject_text}" : "#{user.display_name} shared a #{subject_text} by #{post.author.display_name}",
      blocks: Post::BuildSlackBlocks.new(
        post: post,
        slack_context_block: mrkdwn_section_block(text: share_by_author? ? "*#{user.display_name}* shared a #{subject_text}:" : "*#{user.display_name}* shared a #{subject_text} by *#{post.author.display_name}*:"),
      ).run,
      link_names: true,
      unfurl_links: post.unfurl_description_links_in_slack?,
    }

    message[:channel] = slack_channel_id
    message_result = post.slack_client.chat_postMessage(message)
    permalink_result = post.slack_client.chat_getPermalink({ channel: slack_channel_id, message_ts: message_result["ts"] })
    post.links.create(name: PostLink::SLACK, url: permalink_result["permalink"])
  rescue Slack::Web::Api::Errors::NotInChannel
    # join the slack channel
    post.slack_client.conversations_join(channel: slack_channel_id)

    create_slack_message!
  end

  private

  def member_ids_must_be_valid
    return unless member_ids

    member_ids.each do |member_id|
      next if members.pluck(:public_id).include?(member_id)

      errors.add(:base, "#{member_id} is not a valid member ID")
    end
  end

  def members
    return [] unless member_ids

    @members ||= organization.kept_memberships.where(public_id: member_ids).to_a
  end

  def slack_channel_id_must_belong_to_organization
    return unless slack_channel_id
    return if organization.slack_channels.find_by(provider_channel_id: slack_channel_id)

    errors.add(:slack_channel_id, "does not belong to organization")
  end

  def target_must_be_present
    return if member_ids.present? || slack_channel_id

    errors.add(:base, "Must provide at least one person or Slack channel")
  end

  def share_by_author?
    post.user == user
  end
end
