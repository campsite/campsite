class ChangeEmailToText < ActiveRecord::Migration[7.0]
  def change
    # remove indexes
    remove_index :email_bounces, :email
    remove_index :organization_invitations, [:organization_id, :email]
    remove_index :users, :email

    change_column(:email_bounces, :email, :text, null: false, limit: 320)
    change_column(:organization_invitations, :email, :text, null: false, limit: 320)
    change_column(:organizations, :billing_email, :text, limit: 320)
    change_column(:users, :email, :text, null: false, default: nil, limit: 320)
    change_column(:users, :unconfirmed_email, :text, limit: 320)

    add_index :email_bounces, :email, unique: true, length: 320
    add_index :organization_invitations, [:organization_id, :email], length: { email: 320 }, unique: true
    add_index :users, :email, unique: true, length: 320
  end
end
