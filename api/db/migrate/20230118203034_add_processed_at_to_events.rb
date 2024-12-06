class AddProcessedAtToEvents < ActiveRecord::Migration[7.0]
  def change
    add_column :events, :processed_at, :datetime
  end
end
