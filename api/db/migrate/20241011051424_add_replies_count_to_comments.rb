class AddRepliesCountToComments < ActiveRecord::Migration[7.2]
  def change
    add_column :comments, :replies_count, :integer, null: false, default: 0
    Comment.counter_culture_fix_counts only: :parent, if: Rails.env.development? && !ENV['ENABLE_PSDB']
  end
end
