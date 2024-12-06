# frozen_string_literal: true

class Organization
  class InviteMembers
    class Error < StandardError; end

    def initialize(organization:, sender:, invitations:)
      @invitations = invitations
      @organization = organization
      @sender = sender
    end

    def run
      remove_existing_members
      remove_existing_invitations
      destroy_existing_expired_invitations
      existing_recipients = find_existing_recipients(@invitations.pluck(:email))

      build_invitations = @invitations.map do |invitation|
        {
          email: invitation[:email].downcase,
          sender: @sender,
          recipient: existing_recipients[invitation[:email]],
          role: invitation[:role],
          organization_invitation_projects_attributes: Project.where(public_id: invitation[:project_ids]).map { |project| { project: project } },
        }
      end

      @organization.invitations.create!(build_invitations)
    end

    private

    def remove_existing_members
      existing = @organization.members.where(email: @invitations.pluck(:email)).pluck(:email)
      @invitations = @invitations.filter { |i| existing.exclude?(i[:email]) }
    end

    def remove_existing_invitations
      existing = @organization.invitations
        .where(email: @invitations.pluck(:email))
        .where("expires_at > ?", Time.current)
        .pluck(:email)
      @invitations = @invitations.filter { |i| existing.exclude?(i[:email]) }
    end

    def destroy_existing_expired_invitations
      @organization.invitations
        .where(email: @invitations.pluck(:email))
        .where("expires_at <= ?", Time.current)
        .destroy_all
    end

    def find_existing_recipients(emails)
      User.where(email: emails).index_by(&:email)
    end
  end
end
