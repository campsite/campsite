class DropIntercomColumns < ActiveRecord::Migration[7.0]
  def change
    remove_column :organizations, :intercom_company_id
    remove_column :users, :intercom_contact_id
  end
end
