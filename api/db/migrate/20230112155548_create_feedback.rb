class CreateFeedback < ActiveRecord::Migration[7.0]
  def change
    create_table :feedbacks do |t|
      t.string :description, null: false
      t.integer :feedback_type, null: false, unsigned: true
      t.datetime :posted_to_linear_at
      t.references :user, null: false, unsigned: true

      t.timestamps
    end
  end
end
