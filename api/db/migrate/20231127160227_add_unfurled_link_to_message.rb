class AddUnfurledLinkToMessage < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :unfurled_link, :text
  end
end
