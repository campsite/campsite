class AddOrganizations < ActiveRecord::Migration[7.0]
  def change
    create_table :organizations, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :name, null: false
      t.string :slug, null: false, index: { unique: true }
      t.string :stripe_customer_id, index: true
      t.string :email_domain, index: true
      t.string :billing_email
      t.string :avatar_path
      t.string :slack_channel_id
      t.string :invite_token, null: false, index: { unique: true }
      t.references :creator, null: :false, index: false, unsigned: true
      t.datetime :onboarded_at
      t.timestamps
    end

    create_table :organization_invitations, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :email, null: false
      t.references :organization, null: false, index: false, unsigned: true
      t.references :sender, index: true, null: false, unsigned: true
      t.references :recipient, index: false, unsigned: true
      t.string     :role, null: false, index: true
      t.string     :invite_token, index: { unique: true }, null: false
      t.datetime   :expires_at, null: false, index: true
      t.timestamps
    end

    add_index :organization_invitations, [:organization_id, :email], unique: true
    add_index :organization_invitations, [:organization_id, :recipient_id], unique: true,
      name: "idx_org_invitations_on_org_id_and_recipient_id"

    create_table :organization_memberships, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.references :organization, index: true, null: false, unsigned: true
      t.string     :role, null: false, index: true
      t.references :user, null: false
      t.timestamps
    end

    add_index :organization_memberships, [:organization_id, :user_id], unique: true

    create_table :organization_membership_requests, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.references :user, null: false
      t.references :organization, null: false, unsigned: true
      t.timestamps
    end

    add_index :organization_membership_requests, [:organization_id, :user_id], unique: true,
      name: "idx_org_memberhip_requests_on_org_id_and_user_id"
  end
end
