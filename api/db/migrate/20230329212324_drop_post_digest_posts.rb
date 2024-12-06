# frozen_string_literal: true

class DropPostDigestPosts < ActiveRecord::Migration[7.0]
  def change
    drop_table(:post_digest_posts, if_exists: true, id: { type: :bigint, unsigned: true }) do |t|
      t.bigint("post_id", null: false, unsigned: true)
      t.bigint("post_digest_id", null: false, unsigned: true)
      t.integer("position", default: 0)
      t.datetime("created_at", null: false)
      t.datetime("updated_at", null: false)
      t.index(["position"], name: "index_post_digest_posts_on_position")
      t.index(["post_digest_id"], name: "index_post_digest_posts_on_post_digest_id")
      t.index(["post_id", "post_digest_id"], name: "index_post_digest_posts_on_post_id_and_post_digest_id", unique: true)
      t.index(["post_id"], name: "index_post_digest_posts_on_post_id")
    end
  end
end
