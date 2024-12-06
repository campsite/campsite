class CreateFigmaUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :figma_users, id: { type: :bigint, unsigned: true } do |t|
      t.bigint :user_id, null: false, unsigned: true, index: true
      t.string :remote_user_id, null: false
      t.string :handle, null: false
      t.string :email, null: false
      t.string :img_url, null: false

      t.timestamps
    end
  end
end
