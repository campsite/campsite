# frozen_string_literal: true

class OrganizationInvitation < ApplicationRecord
  class AcceptError < StandardError; end

  include PublicIdGenerator
  include Tokenable

  validates :role, presence: true
  validates :expires_at, presence: true
  validates :invite_token, presence: true, uniqueness: true
  validates :email,
    presence: true,
    format: { with: User::EMAIL_REGEX },
    uniqueness: { scope: :organization }

  after_create_commit :send_invitation_email

  before_validation :set_tokenable
  before_validation :set_expires_at, on: :create

  belongs_to :organization
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User", optional: true
  has_many :organization_invitation_projects, dependent: :destroy_async
  has_many :projects, through: :organization_invitation_projects

  accepts_nested_attributes_for :organization_invitation_projects

  scope :search_by, ->(query_string) do
    where("email LIKE ?", "%#{query_string}%")
  end

  scope :role_counted, -> { where(role: Role.counted.map(&:name)) }

  INVITATION_DURATION = 1.month

  def tokenable_attribute
    :invite_token
  end

  def recipient_is_existing_user?
    recipient_id.present?
  end

  def send_invitation_email
    OrganizationMailer.invite_member(self).deliver_later
  end

  def invitation_url
    Campsite.app_url(path: "/invitation/#{invite_token}")
  end

  def expired?
    Time.current >= expires_at
  end

  def api_type_name
    "OrganizationInvitation"
  end

  def accept!(user)
    raise AcceptError, "The invitation has expired" if expired?
    if user.email != email
      raise AcceptError, "Your email does not match the email of the invitation. Please sign in or sign up with the correct email."
    end

    # add user to org as a member
    membership = organization.create_membership!(user: user, role_name: role, projects: projects, inviting_member: sender.kept_organization_memberships.find_by(organization: organization))
    # return the membership
    membership
  end

  private

  def set_expires_at
    self.expires_at = Time.current + INVITATION_DURATION
  end
end
