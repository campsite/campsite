class DropPostReactions < ActiveRecord::Migration[7.0]
  def change
    drop_table :post_reactions, id: { type: :bigint, unsigned: true } do |t|
      t.string "public_id", limit: 12, null: false
      t.string "content", null: false
      t.bigint "post_id", null: false, unsigned: true
      t.bigint "user_id", null: false, unsigned: true
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.bigint "organization_membership_id", unsigned: true
      t.index ["organization_membership_id"], name: "index_post_reactions_on_organization_membership_id"
      t.index ["post_id"], name: "index_post_reactions_on_post_id"
      t.index ["public_id"], name: "index_post_reactions_on_public_id", unique: true
      t.index ["user_id", "post_id", "content"], name: "index_post_reactions_on_user_id_and_post_id_and_content", unique: true
      t.index ["user_id"], name: "index_post_reactions_on_user_id"
    end
  end
end
