class CreatePostDigestBasicPosts < ActiveRecord::Migration[7.0]
  def change
    create_table(:post_digest_basic_posts, id: { type: :bigint, unsigned: true }) do |t|
      t.references(:post, null: false, unsigned: true)
      t.references(:post_digest, null: false, unsigned: true)
      t.integer(:position, default: 0, index: true)
      t.timestamps
    end

    add_column :post_digests, :basic, :boolean, default: false, null: false
  end
end
