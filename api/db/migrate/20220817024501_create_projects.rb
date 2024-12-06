class CreateProjects < ActiveRecord::Migration[7.0]
  def change
    create_table :projects, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :name, null: false
      t.text       :description
      t.string     :slack_channel_id
      t.references :creator, null: false, index: false, unsigned: true
      t.references :organization, null: false, index: false, unsigned: true
      t.datetime   :archived_at, index: true
      t.references :archived_by, index: false, unsigned: true
      t.timestamps
    end

    add_column :posts, :project_id, :bigint, null: true, unsigned: true

    create_table :follows, id: { type: :bigint, unsigned: true } do |t|
      t.references :follower, null: false, index: false, unsigned: true
      t.references :followed, polymorphic: true, unsigned: true
      t.timestamps
    end

    add_index :follows, [:followed_type, :followed_id, :follower_id], unique: true
  end
end
