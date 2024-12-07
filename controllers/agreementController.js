import db from '../db.js';

export const createAgreement = async (req, res) => {
    const {
        ref_dipo_amt, agri_durr, mnth_rent_amt, rent_not_fix,
        inc_by_amt_from, inc_amt_to, inc_by_per_month, inc_by_per_to_percent,
        non_ref_deposit, agriment_date, agriment_type, min_lokin_period,
        deposit_payment_mode, reg_fee_paid_by, mentenence_paid_by, amenities,
        misc_clause_desc, printing_cleaning_charges, property_cond_upo_vac,
        property_type, flour_num, flat_number, building_name, locality,
        road_street, society_name, pincode, distric, tahasil, village_city,
        property_num_type, property_number, builtup_area_house, builtup_area_unit,
        use_of_area, parking_area, parking_area_unit, gallery_area,
        gallery_area_unit, landloard_entity_type, landloard_name, landloard_phone,
        have_landloard_aadhar, landloard_pan_number, landloard_email,
        landloard_building_name, flat_house_no, landloard_floor_no,
        landloard_road_street, landloard_pincode, landloard_village_city,
        landloard_dist, landloard_state, exicuting_through, tenant_entity_type,
        tenant_name, tanent_phone, tanent_adhar_card, tenant_email, tanent_pan,
        tenant_building_name, tenant_flat_no, tenant_road_street, tenant_pincode,
        tenant_village_city, tenant_district, tenant_state, tenant_exec_through,
        delivery_add_fullname, delivery_address_email, delivery_address_phone,
        delivery_address_pincode, delivery_type
      } = req.body;

  // Validate required fields
  if (!agriment_date || !agriment_type || !landloard_name || !tenant_name || !mnth_rent_amt) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    // Insert data into the database using the query() method
    const query = `
    INSERT INTO rent_agriment_enquiry (
      ref_dipo_amt, agri_durr, mnth_rent_amt, rent_not_fix,
      inc_by_amt_from, inc_amt_to, inc_by_per_month, inc_by_per_to_percent,
      non_ref_deposit, agriment_date, agriment_type, min_lokin_period,
      deposit_payment_mode, reg_fee_paid_by, mentenence_paid_by, amenities,
      misc_clause_desc, printing_cleaning_charges, property_cond_upo_vac,
      property_type, flour_num, flat_number, building_name, locality,
      road_street, society_name, pincode, distric, tahasil, village_city,
      property_num_type, property_number, builtup_area_house, builtup_area_unit,
      use_of_area, parking_area, parking_area_unit, gallery_area,
      gallery_area_unit, landloard_entity_type, landloard_name, landloard_phone,
      have_landloard_aadhar, landloard_pan_number, landloard_email,
      landloard_building_name, flat_house_no, landloard_floor_no,
      landloard_road_street, landloard_pincode, landloard_village_city,
      landloard_dist, landloard_state, exicuting_through, tenant_entity_type,
      tenant_name, tanent_phone, tanent_adhar_card, tenant_email, tanent_pan,
      tenant_building_name, tenant_flat_no, tenant_road_street, tenant_pincode,
      tenant_village_city, tenant_district, tenant_state, tenant_exec_through,
      delivery_add_fullname, delivery_address_email, delivery_address_phone,
      delivery_address_pincode, delivery_type
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `;


    const values = [
        ref_dipo_amt, agri_durr, mnth_rent_amt, rent_not_fix,
        inc_by_amt_from, inc_amt_to, inc_by_per_month, inc_by_per_to_percent,
        non_ref_deposit, agriment_date, agriment_type, min_lokin_period,
        deposit_payment_mode, reg_fee_paid_by, mentenence_paid_by, amenities,
        misc_clause_desc, printing_cleaning_charges, property_cond_upo_vac,
        property_type, flour_num, flat_number, building_name, locality,
        road_street, society_name, pincode, distric, tahasil, village_city,
        property_num_type, property_number, builtup_area_house, builtup_area_unit,
        use_of_area, parking_area, parking_area_unit, gallery_area,
        gallery_area_unit, landloard_entity_type, landloard_name, landloard_phone,
        have_landloard_aadhar, landloard_pan_number, landloard_email,
        landloard_building_name, flat_house_no, landloard_floor_no,
        landloard_road_street, landloard_pincode, landloard_village_city,
        landloard_dist, landloard_state, exicuting_through, tenant_entity_type,
        tenant_name, tanent_phone, tanent_adhar_card, tenant_email, tanent_pan,
        tenant_building_name, tenant_flat_no, tenant_road_street, tenant_pincode,
        tenant_village_city, tenant_district, tenant_state, tenant_exec_through,
        delivery_add_fullname, delivery_address_email, delivery_address_phone,
        delivery_address_pincode, delivery_type
      ];


    const [data] = await db.query(query, values);

    // Check if we have a valid insertId
    if (!data || data.affectedRows === 0) {
      return res.status(500).json({
        message: 'Failed to create agreement',
        error: 'Insert failed',
      });
    }

    res.status(201).json({
      message: 'Agreement created successfully!',
      data: { id: data.insertId },
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({
      message: 'Failed to create agreement',
      error: error.message,
    });
  }
};

export const getAgreements = async (req, res) => {
  try {
    
      const searchPhone = req.query.searchPhone || ""; 
      const searchDate  = req.query.searchDate || "";
      const searchType  = req.query.searchType || ""; 
      const page        = parseInt(req.query.page) || 1;
      const limit       = 10; 
      const offset      = (page - 1) * limit;

    let searchQuery = "WHERE 1 = 1"; 

    if (searchPhone) {
      searchQuery += ` AND delivery_address_phone LIKE '%${searchPhone}%'`;
    }

    if (searchDate) {
      searchQuery += ` AND agriment_date LIKE '%${searchDate}%'`;
    }

    if (searchType) {
      searchQuery += ` AND agriment_type LIKE '%${searchType}%'`;
    }

    const totalCountQuery = `SELECT COUNT(*) AS count FROM rent_agriment_enquiry ${searchQuery}`;
    const agreementsQuery = `SELECT * FROM rent_agriment_enquiry ${searchQuery} LIMIT ${limit} OFFSET ${offset}`;

    const [[totalCountResult]] = await db.query(totalCountQuery);
    const totalCount = totalCountResult.count;

    const [agreements] = await db.query(agreementsQuery);

    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = offset + 1;
    const endIndex   = Math.min(offset + limit, totalCount);

    res.render("agreements", {
      agreements,
      searchPhone,
      searchDate,
      searchType,
      totalCount,
      totalPages,
      page,
      startIndex,
      endIndex
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching agreements");
  }
};
  
export const getAgreementDetails = async (req, res) => {
    const { id } = req.params;
    try {
      const query  = "SELECT * FROM rent_agriment_enquiry WHERE id = ?";
      const [rows] = await db.query(query, [id]);
      if (rows.length === 0) {
        return res.status(404).send("Agreement not found");
      }
      res.render("agreementDetails", { agreementDetails: rows[0] });
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).send("Failed to fetch agreement details");
    }
};
