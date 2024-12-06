# frozen_string_literal: true

class CreatePostDigests < ActiveRecord::Migration[7.0]
  def change
    create_table(:post_digests, id: { type: :bigint, unsigned: true }) do |t|
      t.string(:public_id, limit: 12, null: false, index: { unique: true })
      t.references(:organization, null: false, unsigned: true)
      t.references(:creator, null: false, unsigned: true)
      t.string(:title, null: false)
      t.string(:description, null: true)
      t.datetime(:published_at, null: true)
      t.datetime(:discarded_at, null: true)

      t.timestamps
    end

    create_table(:post_digest_posts, id: { type: :bigint, unsigned: true }) do |t|
      t.references(:post, null: false, unsigned: true)
      t.references(:post_digest, null: false, unsigned: true)
      t.integer(:position, default: 0, index: true)
      t.timestamps
    end

    add_index(:post_digest_posts, [:post_id, :post_digest_id], unique: true)
  end
end
