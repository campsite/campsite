# frozen_string_literal: true

class Organization
  class RemoveMember
    class Error < StandardError; end

    def initialize(organization:, membership:)
      @organization = organization
      @membership = membership
    end

    def run
      if @membership.admin? && @organization.admins.length == 1
        raise Error, "Please transfer ownership of the organization before removing your membership."
      end

      if @membership.discard!
        OrganizationMailer.member_removed(@membership.user, @organization).deliver_later
      end
    end
  end
end
