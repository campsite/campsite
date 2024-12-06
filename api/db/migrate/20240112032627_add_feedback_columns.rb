class AddFeedbackColumns < ActiveRecord::Migration[7.1]
  def change
    add_column :feedbacks, :current_url, :text
    add_column :feedbacks, :browser_info, :string
    add_column :feedbacks, :os_info, :string
    add_column :feedbacks, :screenshot_path, :string
    add_column :feedbacks, :sent_to_plain_at, :datetime
  end
end
