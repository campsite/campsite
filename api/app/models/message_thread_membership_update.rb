# frozen_string_literal: true

class MessageThreadMembershipUpdate < ApplicationRecord
  include Discard::Model
  include Eventable

  belongs_to :message_thread
  belongs_to :actor, class_name: "OrganizationMembership"
  delegate :organization, to: :actor

  def send_message!
    return if messages_content.blank?

    messages_content.each { |content| message_thread.send_message!(content: content) }
    message_thread.mark_read(actor)
  end

  def event_actor
    actor
  end

  def event_organization
    organization
  end

  private

  def messages_content
    [].tap do |result|
      if added_organization_memberships.present?
        result.push("#{actor.display_name} added #{added_organization_memberships.map(&:display_name).to_sentence} to this conversation.")
      end

      if added_oauth_applications.present?
        display_names = if added_oauth_applications.size == 1
          "the #{added_oauth_applications.first.name} integration"
        else
          added_oauth_applications.map(&:name).to_sentence.to_s
        end

        result.push("#{actor.display_name} added #{display_names} to this conversation.")
      end

      if removed_organization_memberships.present?
        others_removed = removed_organization_memberships - [actor]
        if others_removed.present?
          result.push("#{actor.display_name} removed #{others_removed.map(&:display_name).to_sentence} from this conversation.")
        end

        if removed_organization_memberships.include?(actor)
          result.push("#{actor.display_name} left this conversation.")
        end
      end

      if removed_oauth_applications.present?
        display_names = if removed_oauth_applications.size == 1
          "the #{removed_oauth_applications.first.name} integration"
        else
          removed_oauth_applications.map(&:name).to_sentence.to_s
        end

        result.push("#{actor.display_name} removed #{display_names} from this conversation.")
      end
    end
  end

  def added_organization_memberships
    @added_organization_memberships ||= organization.memberships.where(id: added_organization_membership_ids)
  end

  def added_oauth_applications
    @added_oauth_applications ||= organization.oauth_applications.where(id: added_oauth_application_ids)
  end

  def removed_organization_memberships
    @removed_organization_memberships ||= organization.memberships.where(id: removed_organization_membership_ids)
  end

  def removed_oauth_applications
    @removed_oauth_applications ||= organization.oauth_applications.where(id: removed_oauth_application_ids)
  end
end
