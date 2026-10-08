import os
from server.database import db
from server.models import Admin, Program, Resource, Gallery, Event, ContactSubmission

def seed_database(app):
    with app.app_context():
        db.create_all()

        # Seed default Admin if not present
        if not Admin.query.filter_by(username='admin').first():
            admin = Admin(
                username='admin',
                email='admin@montessori.edu'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("Default admin user created: admin / admin123")

        # Seed Programs
        if Program.query.count() == 0:
            programs = [
                Program(
                    title="Toddler Program",
                    age_group="1.5 to 3 Years",
                    description="A nurturing environment designed to support independence, motor movement, language acquisition, and social interaction for early learners.",
                    objectives="Develop fine and gross motor skills, encourage self-help skills (dressing, washing), build vocabulary through stories and songs, foster peer cooperation.",
                    activities="Sensorial play, sorting & matching, spooning & pouring exercises, music & movement, storytelling circle time, outdoor nature exploration.",
                    highlights="Low child-to-teacher ratio (1:4), specially designed child-sized furniture, tactile learning materials, calm and warm environment.",
                    icon="blocks"
                ),
                Program(
                    title="Primary Program",
                    age_group="3 to 6 Years",
                    description="The foundational Montessori classroom (Children's House) covering Practical Life, Sensorial, Language, Mathematics, and Cultural Studies.",
                    objectives="Master phonics & reading, grasp concrete math concepts (decimal system & operations), cultivate deep concentration and self-discipline, explore geography and science.",
                    activities="Sandpaper letters & moveable alphabet, golden bead math materials, map puzzles & globe study, plant care & gardening, art & Devanagari script tracing.",
                    highlights="Mixed-age classroom foster mentorship, 3-hour uninterrupted work cycles, individual progress tracking, bilingual Hindi & English learning.",
                    icon="script"
                ),
                Program(
                    title="Elementary Program",
                    age_group="6 to 12 Years",
                    description="Focuses on cosmic education, abstract reasoning, collaborative projects, scientific inquiry, advanced literacy, and community involvement.",
                    objectives="Develop critical thinking & research skills, master advanced arithmetic & geometry, understand world history & biomes, build strong written & verbal communication.",
                    activities="Five Great Lessons storytelling, science laboratory experiments, community field trips ('Going Out'), creative writing & drama, math stamp game.",
                    highlights="Student-led research projects, interdisciplinary learning modules, peer leadership, active problem-solving.",
                    icon="numbers"
                )
            ]
            db.session.add_all(programs)

        # Seed Resources
        if Resource.query.count() == 0:
            resources = [
                Resource(
                    title="Devanagari Varnamala Tracing Sheet (क ख ग घ)",
                    description="Printable PDF worksheet for children to practice writing Devanagari alphabet letters with directional stroke guides.",
                    category="Devanagari Script",
                    file_path="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    file_type="PDF"
                ),
                Resource(
                    title="English Alphabet & Phonics Printable (A B C D)",
                    description="Colorful visual guide featuring uppercase & lowercase letters with phonics illustrations.",
                    category="English Alphabet",
                    file_path="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    file_type="PDF"
                ),
                Resource(
                    title="Counting Blocks & Number Matching Cards (1-20)",
                    description="Fun counting worksheet with colorful blocks and matching exercises for early learners.",
                    category="Mathematics",
                    file_path="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    file_type="PDF"
                ),
                Resource(
                    title="Montessori Practical Life Parent Guide",
                    description="A practical handbook for parents to implement Montessori practical life activities at home.",
                    category="Guides & Handbooks",
                    file_path="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    file_type="PDF"
                )
            ]
            db.session.add_all(resources)

        # Seed Gallery
        if Gallery.query.count() == 0:
            gallery_items = [
                Gallery(
                    title="Children Exploring Cylinder Blocks",
                    description="Primary program students focusing on visual discrimination of size and dimensions.",
                    media_type="image",
                    file_path="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
                    category="Learning"
                ),
                Gallery(
                    title="Devanagari & English Alphabets Activity",
                    description="Fun bilingual phonics and letter assembly session using colorful wooden cutouts.",
                    media_type="image",
                    file_path="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
                    category="Art"
                ),
                Gallery(
                    title="Annual Montessori Sports Day",
                    description="Joyful physical movement activities, relay games, and outdoor team play.",
                    media_type="image",
                    file_path="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
                    category="Events"
                ),
                Gallery(
                    title="Practical Life - Gardening & Nature Care",
                    description="Students caring for flowers and organic vegetable patches in our school garden.",
                    media_type="image",
                    file_path="https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80",
                    category="Activities"
                ),
                Gallery(
                    title="Montessori Mathematics in Action",
                    description="Demonstrating golden bead materials for place value understanding.",
                    media_type="image",
                    file_path="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
                    category="Learning"
                ),
                Gallery(
                    title="Children's Cultural Music & Performance",
                    description="Singing alphabet songs in Devanagari and English with rhythmic instruments.",
                    media_type="image",
                    file_path="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
                    category="Events"
                )
            ]
            db.session.add_all(gallery_items)

        # Seed Events
        if Event.query.count() == 0:
            events = [
                Event(
                    title="Annual Montessori Open House & Family Day 2026",
                    content="<p>Join us for our annual Open House! Parents and prospective families are invited to walk through our classrooms, experience live Montessori material demonstrations, meet our certified teachers, and participate in fun parent-child workshops.</p>",
                    category="Event",
                    featured_image="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
                    event_date="October 25, 2026",
                    is_important=True
                ),
                Event(
                    title="Devanagari & English Alphabets Reading Week",
                    content="<p>A week-long celebration of language exploration! Children will participate in story reading circles, Devanagari calligraphy art, and interactive phonics games.</p>",
                    category="Announcement",
                    featured_image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
                    event_date="November 10-14, 2026",
                    is_important=False
                ),
                Event(
                    title="Parent-Teacher Conferences Quarter 3",
                    content="<p>One-on-one progress discussions detailing each child's individual developmental milestones, work choices, and social progress in the classroom.</p>",
                    category="News",
                    featured_image="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
                    event_date="December 05, 2026",
                    is_important=True
                )
            ]
            db.session.add_all(events)

        # Seed sample Contact Submission
        if ContactSubmission.query.count() == 0:
            sub = ContactSubmission(
                name="Saraswati Sharma",
                email="saraswati@example.com",
                phone="+977 9841234567",
                message="Hello, I would like to inquire about admissions for the Primary Program (age 4) for the upcoming term. Could you send details on tuition and schedule?",
                is_read=False
            )
            db.session.add(sub)

        db.session.commit()
        print("Database seeded successfully.")
