class AddPosts < ActiveRecord::Migration[7.0]
  def change
    create_table :posts, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.text       :description
      t.string     :slack_message_ts
      t.references :organization, null: false, unsigned: true
      t.references :user, null: false, unsigned: true
      t.timestamps
    end

    create_table :post_link_previews, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :url, null: false
      t.string     :title, null: false
      t.string     :description
      t.string     :image_url
      t.string     :video_url
      t.string     :service_logo
      t.string     :service_name, null: false
      t.boolean    :preview, default: false
      t.references :post, null: false, unsigned: true
      t.timestamps
    end

     create_table :post_links, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :url, null: false
      t.string     :name, null: false
      t.references :post, null: false, unsigned: true
      t.timestamps
    end

    create_table :post_files, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :file_path, null: false
      t.string     :file_type, null: false
      t.references :post, null: false, unsigned: true
      t.timestamps
    end

    create_table :post_reactions, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :content, null: false
      t.references :post, null: false, unsigned: true
      t.references :user, null: false, unsigned: true
      t.timestamps
    end

    create_table :post_views, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.references :post, null: false, unsigned: true
      t.references :user, null: false, unsigned: true
      t.timestamps
    end

    add_index :post_views, [:post_id, :user_id], unique: true
  end
end
