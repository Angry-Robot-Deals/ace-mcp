/**
 * Unit tests for the Playbook component.
 */

import { Playbook, PlaybookError } from '../playbook';

describe('Playbook', () => {
  let playbook: Playbook;

  beforeEach(() => {
    playbook = new Playbook();
  });

  describe('basic operations', () => {
    it('should add a bullet successfully', () => {
      const bullet = playbook.addBullet('Testing', 'Always write unit tests');
      
      expect(bullet.id).toBeDefined();
      expect(bullet.section).toBe('Testing');
      expect(bullet.content).toBe('Always write unit tests');
      expect(bullet.metadata.created).toBeInstanceOf(Date);
      expect(bullet.metadata.helpful_count).toBe(0);
      expect(bullet.metadata.harmful_count).toBe(0);
    });

    it('should retrieve existing bullet', () => {
      const bullet = playbook.addBullet('Testing', 'Test content');
      const retrieved = playbook.getBullet(bullet.id);
      
      expect(retrieved).toEqual(bullet);
    });

    it('should update bullet content', () => {
      const bullet = playbook.addBullet('Testing', 'Original content');
      const updated = playbook.updateBullet(bullet.id, {
        content: 'Updated content'
      });
      
      expect(updated.content).toBe('Updated content');
      expect(updated.id).toBe(bullet.id);
    });

    it('should delete existing bullet', () => {
      const bullet = playbook.addBullet('Testing', 'Test content');
      const deleted = playbook.deleteBullet(bullet.id);
      
      expect(deleted).toBe(true);
      expect(playbook.getBullet(bullet.id)).toBeUndefined();
    });

    it('should get bullet count', () => {
      expect(playbook.getBulletCount()).toBe(0);
      
      playbook.addBullet('Testing', 'Test 1');
      expect(playbook.getBulletCount()).toBe(1);
      
      playbook.addBullet('Testing', 'Test 2');
      expect(playbook.getBulletCount()).toBe(2);
    });

    it('should calculate cosine similarity', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2, 3];
      
      const similarity = Playbook.cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(1.0);
    });

    it('should throw errors for invalid operations', () => {
      expect(() => {
        playbook.addBullet('', 'Some content');
      }).toThrow(PlaybookError);

      expect(() => {
        playbook.addBullet('Testing', '');
      }).toThrow(PlaybookError);

      expect(() => {
        playbook.updateBullet('non-existent', { content: 'New content' });
      }).toThrow(PlaybookError);
    });
  });
});
