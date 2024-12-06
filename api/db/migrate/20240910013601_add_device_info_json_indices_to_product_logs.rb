class AddDeviceInfoJsonIndicesToProductLogs < ActiveRecord::Migration[7.2]
  def change
    add_column :product_logs, :device_info_browser_name, :string, as: "device_info ->> '$.browser_name'", stored: true
    add_index :product_logs, :device_info_browser_name

    add_column :product_logs, :device_info_browser_version, :string, as: "device_info ->> '$.browser_version'", stored: true
    add_index :product_logs, :device_info_browser_version

    add_column :product_logs, :device_info_os_name, :string, as: "device_info ->> '$.os_name'", stored: true
    add_index :product_logs, :device_info_os_name

    add_column :product_logs, :device_info_os_version, :string, as: "device_info ->> '$.os_version'", stored: true
    add_index :product_logs, :device_info_os_version

    add_column :product_logs, :device_info_device_name, :string, as: "device_info ->> '$.device_name'", stored: true
    add_index :product_logs, :device_info_device_name

    add_column :product_logs, :device_info_device_type, :string, as: "device_info ->> '$.device_type'", stored: true
    add_index :product_logs, :device_info_device_type

    add_column :product_logs, :device_info_device_brand, :string, as: "device_info ->> '$.device_brand'", stored: true
    add_index :product_logs, :device_info_device_brand

    add_column :product_logs, :device_info_is_desktop_app, :string, as: "device_info ->> '$.is_desktop_app'", stored: true
    add_index :product_logs, :device_info_is_desktop_app

    add_column :product_logs, :device_info_is_pwa, :string, as: "device_info ->> '$.is_pwa'", stored: true
    add_index :product_logs, :device_info_is_pwa

    add_column :product_logs, :device_info_desktop_app_version, :string, as: "device_info ->> '$.desktop_app_version'", stored: true
    add_index :product_logs, :device_info_desktop_app_version
  end
end
