import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      regNo,
      email,
      phone,
      hostel,
      hostelBlock,
      roomNumber,
      password,
    } = body || {};

    // 1. Strict Server-Side Validation
    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 3 characters)." },
        { status: 400 }
      );
    }

    const cleanRegNo = (regNo || "").trim().toUpperCase().replace(/^LPU/, "");
    if (!cleanRegNo || cleanRegNo.length < 6) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid LPU Registration Number (at least 6 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid university email address." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/[\s\-\+\(\)]/g, "");
    if (!/^[0-9]{10,12}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const blockRoom = `${hostelBlock || "Block A"} / ${roomNumber || "101"}`;
    const initials = fullName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

    // 2. Supabase User Creation
    let authUserId = `std_${Date.now()}`;

    if (isSupabaseConfigured()) {
      try {
        const adminClient = createServerSupabaseClient();

        // Check for existing user with this email or regNo
        const { data: existingUsers } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

        if (existingUsers?.users) {
          const duplicate = existingUsers.users.find((u) => {
            const metaReg = (u.user_metadata?.reg_no || "").trim().toUpperCase().replace(/^LPU/, "");
            return metaReg === cleanRegNo || u.email?.toLowerCase() === cleanEmail;
          });

          if (duplicate) {
            return NextResponse.json(
              {
                success: false,
                error: `An account with Registration Number (${regNo}) or Email (${email}) already exists. Please log in instead.`,
              },
              { status: 409 }
            );
          }
        }

        // Create user with email pre-confirmed
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName.trim(),
            reg_no: cleanRegNo,
            role: "student", // Strictly hardcoded to student
            hostel_name: hostel || "BH-1",
            hostel_block: hostelBlock || "Block A",
            room_number: roomNumber || "101",
            block_room: blockRoom,
            phone: cleanPhone,
          },
        });

        if (createError) {
          return NextResponse.json(
            { success: false, error: createError.message },
            { status: 400 }
          );
        }

        if (newUser?.user) {
          authUserId = newUser.user.id;

          // Attempt database table provisioning
          try {
            await adminClient.from("profiles").upsert({
              id: authUserId,
              email: cleanEmail,
              full_name: fullName.trim(),
              phone: cleanPhone,
              role: "student",
              is_active: true,
            });

            await adminClient.from("students").upsert({
              id: authUserId,
              reg_no: cleanRegNo,
              hostel_id: hostel || "BH-1",
              hostel_block: hostelBlock || "Block A",
              room_number: roomNumber || "101",
              status: "Active",
              wallet_balance: 1000.0,
            });
          } catch (tableErr) {
            console.warn("[Register API] Table insert notice:", tableErr.message);
          }
        }
      } catch (adminErr) {
        console.warn("[Register API] Supabase admin error:", adminErr.message);
      }
    }

    const studentRecord = {
      id: authUserId,
      name: fullName.trim(),
      regNo: cleanRegNo,
      email: cleanEmail,
      phone: cleanPhone,
      hostel: hostel || "BH-1",
      hostelBlock: hostelBlock || "Block A",
      roomNumber: roomNumber || "101",
      blockRoom,
      walletBalance: 1000.0,
      avatar: initials,
      role: "student",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: studentRecord,
      message: "Student account registered successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

