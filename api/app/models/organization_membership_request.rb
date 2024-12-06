# frozen_string_literal: true

class OrganizationMembershipRequest < ApplicationRecord
  include PublicIdGenerator

  belongs_to :organization
  belongs_to :user

  delegate :slug, to: :organization, prefix: true

  validates :organization, uniqueness: { scope: :user, message: "membership already requested" }

  after_create_commit :send_member_request_email

  def approve!
    # add user to org as a member
    membership = organization.create_membership!(user: user, role_name: Role::VIEWER_NAME)
    # send accept email
    UserMailer.membership_request_accepted(user, organization).deliver_later
    # return the org membership
    membership
  end

  def decline!
    destroy!
  end

  def api_type_name
    "OrganizationMembershipRequest"
  end

  private

  def send_member_request_email
    organization.admins.each do |admin|
      OrganizationMailer.membership_request(self, admin).deliver_later
    end
  end
end
