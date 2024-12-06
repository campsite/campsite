# frozen_string_literal: true

class DropFollow < ActiveRecord::Migration[7.1]
  def change
    drop_table :follows, id: { type: :bigint, unsigned: true } do |t|
      t.bigint "follower_id", null: false, unsigned: true
      t.string "followed_type"
      t.bigint "followed_id", unsigned: true
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.bigint "follower_member_id", unsigned: true
      t.index ["followed_type", "followed_id", "follower_id"], name: "index_follows_on_followed_type_and_followed_id_and_follower_id", unique: true
      t.index ["followed_type", "followed_id"], name: "index_follows_on_followed"
      t.index ["follower_member_id"], name: "index_follows_on_follower_member_id"
    end
  end
end
