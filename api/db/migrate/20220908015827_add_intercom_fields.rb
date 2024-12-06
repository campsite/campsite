class AddIntercomFields < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :intercom_contact_id, :string, index: true
    add_column :organizations, :intercom_company_id, :string, index: true
  end
end
