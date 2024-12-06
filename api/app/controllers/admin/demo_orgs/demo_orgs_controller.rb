# frozen_string_literal: true

module Admin
  module DemoOrgs
    class DemoOrgsController < BaseController
      before_action :set_breadcrumbs

      def index
        @demo_orgs = Organization.where(demo: true).order(created_at: :desc)
        @new_org_slug = ::DemoOrgs::Generator::ORG_SLUG + "-#{SecureRandom.hex(4)}"

        render("admin/demo_orgs/demo_orgs/index")
      end

      def create
        org = Organization.create_organization(
          creator: current_user,
          name: ::DemoOrgs::Generator::ORG_NAME,
          slug: params[:slug],
          avatar_path: ::DemoOrgs::Generator::ORG_AVATAR,
          demo: true,
        )

        CreateDemoContentJob.perform_async(org.slug)

        flash[:notice] = "Created #{org.name} instance. Content is created asynchronously and will appear in the new instance shortly."
        redirect_to(demo_orgs_path)
      end

      private

      def set_breadcrumbs
        add_breadcrumb("Demo orgs", demo_orgs_path)
      end
    end
  end
end
