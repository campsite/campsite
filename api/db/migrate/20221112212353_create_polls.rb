class CreatePolls < ActiveRecord::Migration[7.0]
  def change
    create_table :polls, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :description, null: false
      t.integer    :votes_count, default: 0
      t.references :post, null: false, unsigned: true
      t.timestamps
    end

    create_table :poll_options, id: { type: :bigint, unsigned: true } do |t|
      t.string     :public_id, limit: 12, null: false, index: { unique: true }
      t.string     :description, null: false
      t.integer    :votes_count, default: 0
      t.references :poll, null: false, unsigned: true
    end

    create_table :poll_votes, id: { type: :bigint, unsigned: true } do |t|
      t.references :poll_option, null: false, unsigned: true
      t.references :user, null: false, unsigned: true
      t.timestamps
    end
  end
end
