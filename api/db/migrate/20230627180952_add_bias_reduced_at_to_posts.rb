class AddBiasReducedAtToPosts < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :bias_reduced_at, :datetime
  end
end
