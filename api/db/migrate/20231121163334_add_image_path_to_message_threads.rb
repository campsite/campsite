class AddImagePathToMessageThreads < ActiveRecord::Migration[7.1]
  def change
    add_column :message_threads, :image_path, :string
  end
end
