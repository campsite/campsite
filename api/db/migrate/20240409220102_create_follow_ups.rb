class CreateFollowUps < ActiveRecord::Migration[7.1]
  def change
    create_table :follow_ups, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.references :organization_membership, unsigned: true, null: false
      t.references :subject, unsigned: true, null: false, polymorphic: true
      t.timestamp :show_at, null: false

      t.timestamps
    end
  end
end
