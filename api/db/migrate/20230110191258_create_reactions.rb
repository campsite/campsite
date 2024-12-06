class CreateReactions < ActiveRecord::Migration[7.0]
  def change
    create_table :reactions, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false
      t.string :content, null: false
      t.bigint :subject_id, null: false, unsigned: true
      t.string :subject_type, null: false
      t.bigint :user_id, null: false, unsigned: true

      t.timestamps
    end
    add_index :reactions, :user_id
    add_index :reactions, [:subject_id, :subject_type]
    add_index :reactions, [:subject_id, :subject_type, :user_id, :content], unique: true,
      name: :idx_reactions_on_subject_id_type_and_user_id_and_content
  end
end
