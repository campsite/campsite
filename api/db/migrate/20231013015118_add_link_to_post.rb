class AddLinkToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :unfurled_link, :text
  end
end
