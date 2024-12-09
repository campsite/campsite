# frozen_string_literal: true

require "test_helper"

class AttachmentTest < ActiveSupport::TestCase
  context "validations" do
    test "is valid" do
      file = build(:attachment, file_path: "/path/x.png", file_type: "image/png")
      assert_predicate file, :valid?

      file = build(:attachment, file_path: "/path/x.png", file_type: "image/jpg")
      assert_predicate file, :valid?

      file = build(:attachment, file_path: "/path/x.png", file_type: "image/jpeg")
      assert_predicate file, :valid?

      file = build(:attachment, file_path: "/path/x.png", file_type: "video/mp4", preview_file_path: "/path/x.png")
      assert_predicate file, :valid?

      file = build(:attachment, file_path: "/path/x.png", file_type: "origami")
      assert_predicate file, :valid?

      file = build(:attachment, file_path: "/path/x.png", file_type: "principle")
      assert_predicate file, :valid?

      file = build(:attachment, file_path: "/path/x.png", file_type: "lottie")
      assert_predicate file, :valid?
    end

    test "is invalid if maxes out on allowed number of attachments" do
      Comment.stub_const(:FILE_LIMIT, 1) do
        comment = create(:comment)
        create(:attachment, subject: comment)
        new_file = build(:attachment, subject: comment.reload)

        assert_not_predicate new_file, :valid?
        assert_equal ["Comment can have a max of 1 attachments"], new_file.errors.full_messages
      end
    end

    test "is valid if file path belongs to this organization" do
      comment = create(:comment)
      new_file = build(:attachment, subject: comment, file_path: "#{comment.organization.post_file_key_prefix}foobar.jpg")

      assert_predicate new_file, :valid?
    end

    test "is valid if there is no subject" do
      new_file = build(:attachment, subject: nil, file_path: "foobar.jpg")

      assert_predicate new_file, :valid?
    end

    test "is invalid if file path belongs to another organization" do
      other_org = create(:organization)
      comment = create(:comment)
      new_file = build(:attachment, subject: comment, file_path: "#{other_org.post_file_key_prefix}foobar.jpg")

      assert_not_predicate new_file, :valid?
      assert_equal ["File path does not belong to this organization"], new_file.errors.full_messages
    end

    test "is valid if figma link" do
      file = build(:attachment, file_type: "figma", file_path: "https://www.figma.com/file/foobar")
      assert_predicate file, :valid?
    end

    test "is valid if subdomain figma link" do
      file = build(:attachment, file_type: "figma", file_path: "https://foobar.figma.com/file/foobar")
      assert_predicate file, :valid?
    end

    test "is valid if loom link" do
      file = build(:attachment, file_type: "loom", file_path: "https://www.loom.com/file/foobar")
      assert_predicate file, :valid?
    end

    test "is valid if subdomain loom link" do
      file = build(:attachment, file_type: "loom", file_path: "https://foobar.loom.com/file/foobar")
      assert_predicate file, :valid?
    end
  end

  context "image?" do
    test "returns true if the file is an image" do
      file = create(:attachment, file_type: "image/png")
      assert_predicate file, :image?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "video/mp4", preview_file_path: "/path/x.png")
      assert_not_predicate file, :image?
    end
  end

  context "video?" do
    test "returns true if the file is a video" do
      file = create(:attachment, file_type: "video/mp4", preview_file_path: "/path/x.png")
      assert_predicate file, :video?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "image/png")
      assert_not_predicate file, :video?
    end
  end

  context "origami?" do
    test "returns true if the file is a origami prototype" do
      file = create(:attachment, file_type: "origami")
      assert_predicate file, :origami?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "image/png")
      assert_not_predicate file, :origami?
    end
  end

  context "principle?" do
    test "returns true if the file is a principle prototype" do
      file = create(:attachment, file_type: "principle")
      assert_predicate file, :principle?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "image/png")
      assert_not_predicate file, :principle?
    end
  end

  context "stitch?" do
    test "returns true if the file is a stitch prototype" do
      file = create(:attachment, file_type: "stitch")
      assert_predicate file, :stitch?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "image/png")
      assert_not_predicate file, :stitch?
    end
  end

  context "lottie?" do
    test "returns true if the file is a lottie animation" do
      file = create(:attachment, file_type: "lottie")
      assert_predicate file, :lottie?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "image/png")
      assert_not_predicate file, :lottie?
    end
  end

  context "previewable?" do
    test "returns true if the file is previewable" do
      file = create(:attachment, file_type: "video/mp4", preview_file_path: "/path/x.png")
      assert_predicate file, :previewable?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "image/png")
      assert_not_predicate file, :previewable?
    end
  end

  context "figma?" do
    test "returns true if the file is a figma link" do
      file = create(:attachment, file_type: "figma", file_path: "https://www.figma.com/file/foobar")
      assert_predicate file, :figma?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "video/mp4", preview_file_path: "/path/x.png")
      assert_not_predicate file, :figma?
    end
  end

  context "loom?" do
    test "returns true if the file is a figma link" do
      file = create(:attachment, file_type: "figma", file_path: "https://www.loom.com/file/foobar")
      assert_predicate file, :loom?
    end

    test "returns false otherwise" do
      file = create(:attachment, file_type: "video/mp4", preview_file_path: "/path/x.png")
      assert_not_predicate file, :loom?
    end
  end
end
