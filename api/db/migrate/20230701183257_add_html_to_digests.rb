class AddHtmlToDigests < ActiveRecord::Migration[7.0]
  def change
    add_column :post_digest_notes, :content_html, :text
  end
end
